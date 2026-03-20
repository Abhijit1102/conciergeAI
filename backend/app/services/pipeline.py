"""LangGraph pipeline: parse_intent -> generate_proposal -> validate_output."""
import json
import re
from typing import Any, Optional, TypedDict

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

from app.config import get_settings

REQUIRED_FIELDS = ["venue_name", "location", "estimated_cost", "why_it_fits"]

PARSE_INTENT_PROMPT = """Extract structured information from this corporate event planning request. Return ONLY a JSON object with these fields (no markdown, no explanation):
{{
  "headcount": <integer or null>,
  "duration_days": <integer or null>,
  "location_preference": <string - e.g. "mountains", "beach", "city" or null>,
  "budget_usd": <integer or null>,
  "event_type": <string - e.g. "retreat", "team-building", "offsite" or null>
}}
User Request: {query}
"""

VENUE_PROPOSAL_PROMPT = """You are an expert corporate event planner AI. A user wants help planning a corporate offsite event.
User Request: {query}
Extracted Details:
- Headcount: {headcount}
- Duration: {duration_days} days
- Location Preference: {location_preference}
- Budget (USD): ${budget_usd}
- Event Type: {event_type}

Your task: Recommend ONE specific, real-sounding venue that fits these requirements.

CRITICAL RULES:
1. Respond ONLY with a valid JSON object. No markdown. No backticks. No explanation.
2. All 4 fields are REQUIRED. Do not omit any.
3. estimated_cost must include the total dollar amount and what it covers.
4. why_it_fits must mention the budget, headcount, and location type.
5. JSON must be parseable by Python json.loads().

Required JSON format:
{{
  "venue_name": "<Full name of the venue>",
  "location": "<Street address or specific area, City, State ZIP>",
  "estimated_cost": "<Dollar amount and breakdown>",
  "why_it_fits": "<2-3 sentence explanation referencing their requirements>"
}}
Output: """


# ── State ─────────────────────────────────────────────────────────────────────

class GraphState(TypedDict):
    """Shared state passed between LangGraph nodes."""
    query:            str
    parsed_intent:    dict[str, Any]
    raw_ai_response:  str
    venue_proposal:   Optional[dict[str, Any]]
    retry_count:      int
    error:            Optional[str]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_llm() -> ChatGoogleGenerativeAI:
    settings = get_settings()
    return ChatGoogleGenerativeAI(  # type: ignore[call-arg]
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.3,
    )


def _get_content(response: Any) -> str:
    """Safely extract string content from LLM response."""
    content = response.content if hasattr(response, "content") else str(response)
    if isinstance(content, list):
        return " ".join(
            block["text"] if isinstance(block, dict) else str(block)
            for block in content
        ).strip()
    return str(content).strip()


def _sanitize_query(query: str) -> str:
    """Strip HTML/script tags from user input."""
    return re.sub(r"<[^>]+>", "", query).strip()


def _extract_json(text: str) -> str | None:
    """Extract JSON from LLM output, handling markdown code fences."""
    text = text.strip()
    if "```json" in text:
        start = text.find("```json") + 7
        end   = text.find("```", start)
        if end != -1:
            return text[start:end].strip()
    if "```" in text:
        start = text.find("```") + 3
        end   = text.find("```", start)
        if end != -1:
            return text[start:end].strip()
    return text


# ── Nodes ─────────────────────────────────────────────────────────────────────

def parse_intent(state: GraphState) -> GraphState:
    """Node 1: Extract structured intent from natural language query."""
    query = _sanitize_query(state["query"])
    llm   = _get_llm()

    response = llm.invoke(PARSE_INTENT_PROMPT.format(query=query))
    content  = _get_content(response)

    parsed: dict[str, Any] = {
        "headcount":           None,
        "duration_days":       None,
        "location_preference": None,
        "budget_usd":          None,
        "event_type":          None,
    }
    try:
        json_str = _extract_json(content)
        if json_str:
            parsed = json.loads(json_str)
    except json.JSONDecodeError:
        pass

    state["parsed_intent"] = parsed
    return state


def generate_proposal(state: GraphState) -> GraphState:
    """Node 2: Call Gemini to generate venue proposal JSON."""
    intent = state.get("parsed_intent") or {}
    llm    = _get_llm()

    prompt = VENUE_PROPOSAL_PROMPT.format(
        query               = state["query"],
        headcount           = intent.get("headcount")           or "N/A",
        duration_days       = intent.get("duration_days")       or "N/A",
        location_preference = intent.get("location_preference") or "N/A",
        budget_usd          = intent.get("budget_usd")          or "N/A",
        event_type          = intent.get("event_type")          or "N/A",
    )

    response = llm.invoke(prompt)
    state["raw_ai_response"] = _get_content(response)
    return state


def validate_output(state: GraphState) -> GraphState:
    """Node 3: Validate JSON schema — retry once if invalid."""
    raw         = state.get("raw_ai_response", "")
    retry_count = state.get("retry_count", 0)

    try:
        json_str = _extract_json(raw)
        if not json_str:
            raise ValueError("No JSON found in AI response")

        data = json.loads(json_str)

        for field in REQUIRED_FIELDS:
            if field not in data or not data[field]:
                raise ValueError(f"Missing or empty field: {field}")

        state["venue_proposal"] = data
        state["error"]          = None
        return state

    except (json.JSONDecodeError, ValueError) as exc:
        if retry_count < 1:
            state["retry_count"] = retry_count + 1
            return generate_proposal(state)

        state["error"]          = str(exc)
        state["venue_proposal"] = None
        return state


# ── Graph ─────────────────────────────────────────────────────────────────────

_graph: CompiledStateGraph | None = None


def build_graph() -> CompiledStateGraph:
    """Compile the LangGraph workflow."""
    workflow = StateGraph(GraphState)

    workflow.add_node("parse_intent",      parse_intent)
    workflow.add_node("generate_proposal", generate_proposal)
    workflow.add_node("validate_output",   validate_output)

    workflow.set_entry_point("parse_intent")
    workflow.add_edge("parse_intent",      "generate_proposal")
    workflow.add_edge("generate_proposal", "validate_output")
    workflow.add_edge("validate_output",   END)

    return workflow.compile()


def get_graph() -> CompiledStateGraph:
    """Lazy-initialize and cache the compiled graph."""
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph


# ── Public API ────────────────────────────────────────────────────────────────

async def run_venue_pipeline(query: str) -> dict[str, Any]:
    """
    Run the full LangGraph pipeline and return a venue_proposal dict.
    Raises ValueError if validation fails after one retry.
    """
    initial_state: GraphState = {
        "query":           _sanitize_query(query),
        "parsed_intent":   {},
        "raw_ai_response": "",
        "venue_proposal":  None,
        "retry_count":     0,
        "error":           None,
    }

    result = await get_graph().ainvoke(initial_state)

    if result.get("error") or not result.get("venue_proposal"):
        raise ValueError(
            result.get("error")
            or "AI could not generate a valid response. Please try again."
        )

    return result["venue_proposal"]
