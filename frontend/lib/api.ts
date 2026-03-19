import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  QueryRequest,
  QueryResponse,
  HistoryResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Mock mode when no API URL - for UI demo
const MOCK_MODE = !API_URL || API_URL.includes("localhost");

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const MOCK_VENUES: QueryResponse["proposal"][] = [
  {
    venue_name: "Mountain View Lodge",
    location: "Aspen, Colorado",
    estimated_cost: "$3,200 - $4,500",
    why_it_fits:
      "Perfect for leadership retreats. Secluded mountain setting with 12 rooms, conference facilities, and team-building activities. Within your budget and accommodates your group size.",
  },
  {
    venue_name: "Pine Ridge Conference Center",
    location: "Denver, Colorado",
    estimated_cost: "$2,800 - $3,800",
    why_it_fits:
      "Modern conference center with mountain views. Includes catering, AV equipment, and breakout rooms. Ideal for 10-person retreats with outdoor team activities.",
  },
  {
    venue_name: "Summit Retreat Estate",
    location: "Vail, Colorado",
    estimated_cost: "$4,000 - $5,200",
    why_it_fits:
      "Luxury estate with full-service retreat planning. 3-day packages include accommodations, meals, and facilitated sessions. Premium option that maximizes your budget.",
  },
];

function randomVenue() {
  return MOCK_VENUES[Math.floor(Math.random() * MOCK_VENUES.length)];
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  if (MOCK_MODE) {
    await delay(600);
    return {
      access_token: "mock-jwt-token",
      token_type: "bearer",
      expires_in: 3600,
      user: { id: "1", username: body.email.split("@")[0], email: body.email },
    };
  }
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function register(body: RegisterRequest): Promise<void> {
  if (MOCK_MODE) {
    await delay(600);
    return;
  }
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Registration failed");
}

export async function submitQuery(body: QueryRequest): Promise<QueryResponse> {
  if (MOCK_MODE) {
    await delay(1500 + Math.random() * 1000);
    return {
      id: `mock-${Date.now()}`,
      query: body.query,
      proposal: randomVenue(),
      timestamp: new Date().toISOString(),
    };
  }
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Query failed");
  return res.json();
}

export async function getHistory(): Promise<HistoryResponse> {
  if (MOCK_MODE) {
    await delay(400);
    return { items: [], total: 0 };
  }
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${API_URL}/history`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}
