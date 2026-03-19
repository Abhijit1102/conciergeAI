<div align="center">

```
 █████╗ ██╗    ███████╗██╗   ██╗███████╗███╗   ██╗████████╗
██╔══██╗██║    ██╔════╝██║   ██║██╔════╝████╗  ██║╚══██╔══╝
███████║██║    █████╗  ██║   ██║█████╗  ██╔██╗ ██║   ██║
██╔══██║██║    ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║
██║  ██║██║    ███████╗ ╚████╔╝ ███████╗██║ ╚████║   ██║
╚═╝  ╚═╝╚═╝    ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝
     C O N C I E R G E  ·  B A C K E N D  A P I
```

**AI-powered corporate offsite planning — FastAPI backend**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-0.1-6366f1?style=flat-square&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Railway](https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)

</div>

---

## 01 · Endpoints

| Method | Endpoint                |   Auth   | Description                              |
| :----: | ----------------------- | :------: | ---------------------------------------- |
| `POST` | `/api/v1/auth/register` |    —     | Create a new user account                |
| `POST` | `/api/v1/auth/login`    |    —     | Login and receive a JWT token            |
| `POST` | `/api/v1/query`         | `🔒 JWT` | Submit a natural language event query    |
| `GET`  | `/api/v1/history`       | `🔒 JWT` | Fetch authenticated user's query history |
| `GET`  | `/api/v1/health`        |    —     | Railway health check                     |

> **Interactive docs** → `http://localhost:8000/docs` · ReDoc → `http://localhost:8000/redoc`

---

## 02 · Setup

### 1 · Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in the three required secrets:

```env
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/aieventconcierge
GEMINI_API_KEY=AIza••••••••••••••••••••••••••••••
JWT_SECRET=your-minimum-32-character-secret-here   # min 32 chars
```

| Variable         | Required | Notes                                                                     |
| ---------------- | :------: | ------------------------------------------------------------------------- |
| `MONGODB_URL`    |    ✅    | Local or MongoDB Atlas connection string                                  |
| `GEMINI_API_KEY` |    ✅    | [console.cloud.google.com](https://console.cloud.google.com) → Gemini API |
| `JWT_SECRET`     |    ✅    | Minimum 32 random characters                                              |

### 2 · Install dependencies

```bash
pip install -r requirements.txt
```

### 3 · Run

```bash
uvicorn app.main:app --reload
```

```
API  →  http://localhost:8000
Docs →  http://localhost:8000/docs
```

---

## 03 · Docker

```bash
# Build
docker build -t ai-event-concierge-backend .

# Run
docker run -p 8000:8000 --env-file .env ai-event-concierge-backend
```

---

## 04 · Tech Stack

| Layer            | Library                | Version | Role                                         |
| ---------------- | ---------------------- | :-----: | -------------------------------------------- |
| Web framework    | FastAPI + uvicorn      | `0.111` | Async API, auto OpenAPI docs                 |
| AI orchestration | LangGraph              |  `0.1`  | 3-node pipeline: parse → generate → validate |
| LLM              | Gemini 1.5 Flash       |    —    | Structured JSON venue proposals              |
| Database         | MongoDB Atlas + Beanie | `1.26`  | Async ODM, Motor driver                      |
| Auth             | python-jose + bcrypt   |  `3.3`  | JWT (24h) + password hashing (cost 12)       |
| Validation       | Pydantic v2            |  `2.7`  | Request / response schemas                   |

---

## 05 · Project Structure

```
app/
├── main.py              # FastAPI app + lifespan (DB init)
├── routers/
│   ├── auth.py          # POST /register, POST /login
│   ├── query.py         # POST /query
│   └── history.py       # GET /history
├── models/
│   ├── user.py          # Beanie User document
│   └── query.py         # Beanie Query document
├── schemas/
│   ├── auth.py          # RegisterRequest, LoginRequest, LoginResponse
│   └── query.py         # QueryRequest, VenueProposal, QueryResponse
├── services/
│   └── langgraph/
│       ├── graph.py     # LangGraph pipeline definition
│       ├── nodes.py     # parse_intent · generate_proposal · validate_output
│       └── state.py     # GraphState TypedDict
├── core/
│   ├── config.py        # Settings (pydantic-settings)
│   ├── security.py      # JWT encode/decode, bcrypt helpers
│   └── database.py      # Beanie + Motor init
└── middleware/
    └── auth.py          # JWT bearer dependency
```

---

## 06 · LangGraph Pipeline

```
User query
    │
    ▼
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│  parse_intent   │────▶│  generate_proposal   │────▶│ validate_output  │
│                 │     │                      │     │                  │
│ Extracts:       │     │ Calls Gemini 1.5     │     │ JSON schema      │
│ · headcount     │     │ Flash with           │     │ check · retry    │
│ · duration      │     │ structured prompt    │     │ once on fail     │
│ · location type │     │                      │     │                  │
│ · budget        │     │                      │◀────│  (retry loop)    │
└─────────────────┘     └──────────────────────┘     └──────────────────┘
                                                              │
                                                              ▼
                                                    { venue_name,
                                                      location,
                                                      estimated_cost,
                                                      why_it_fits }
```

---

## 07 · Sample Request & Response

**Request**

```http
POST /api/v1/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "10-person leadership retreat in the mountains, 3 days, $4000 budget"
}
```

**Response**

```json
{
  "id": "6683abc123def456789012",
  "query": "10-person leadership retreat in the mountains, 3 days, $4000 budget",
  "proposal": {
    "venue_name": "Eagle Ridge Mountain Lodge",
    "location": "Blue Ridge Parkway, Asheville, NC 28805",
    "estimated_cost": "$3,750 for 3 nights (accommodations + boardroom)",
    "why_it_fits": "Secluded 12-person lodge with dedicated boardroom, fast WiFi,
                    and team-building trails. Fits within the $4,000 budget at
                    $1,250/night, 2.5 hours from major airports."
  },
  "timestamp": "2025-06-15T09:23:41.123Z"
}
```

---

<div align="center">

`v1.0.0` · Built for 48-hour MVP · Deploy target: [Railway](https://railway.app)

</div>
