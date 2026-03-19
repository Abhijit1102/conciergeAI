export interface VenueProposal {
  venue_name: string;
  location: string;
  estimated_cost: string;
  why_it_fits: string;
}

export interface QueryResponse {
  id: string;
  query: string;
  proposal: VenueProposal;
  timestamp: string;
}

export interface HistoryResponse {
  items: QueryResponse[];
  total: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserSummary;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface QueryRequest {
  query: string;
}
