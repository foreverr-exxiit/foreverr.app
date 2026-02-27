import { create } from "zustand";

type FeedFilter = "all" | "tributes" | "candles" | "follows" | "badges" | "events" | "donations";

interface SocialState {
  feedFilter: FeedFilter;
  setFeedFilter: (filter: FeedFilter) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  feedFilter: "all",
  setFeedFilter: (filter) => set({ feedFilter: filter }),
}));
