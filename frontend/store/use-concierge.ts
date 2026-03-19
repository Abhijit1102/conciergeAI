import { create } from "zustand";
import type { QueryResponse } from "@/types";

interface ConciergeState {
  currentResult:   QueryResponse | null;
  isLoading:       boolean;
  error:           string | null;
  history:         QueryResponse[];
  activeHistoryId: string | null;
  setCurrentResult:   (r: QueryResponse) => void;
  setLoading:         (v: boolean) => void;
  setError:           (e: string | null) => void;
  setHistory:         (h: QueryResponse[]) => void;
  prependHistory:     (r: QueryResponse) => void;
  setActiveHistoryId: (id: string | null) => void;
}

export const useConcierge = create<ConciergeState>((set) => ({
  currentResult:   null,
  isLoading:       false,
  error:           null,
  history:         [],
  activeHistoryId: null,
  setCurrentResult:   (r)  => set({ currentResult: r }),
  setLoading:         (v)  => set({ isLoading: v }),
  setError:           (e)  => set({ error: e }),
  setHistory:         (h)  => set({ history: h }),
  prependHistory:     (r)  => set((s) => ({ history: [r, ...s.history] })),
  setActiveHistoryId: (id) => set({ activeHistoryId: id }),
}));
