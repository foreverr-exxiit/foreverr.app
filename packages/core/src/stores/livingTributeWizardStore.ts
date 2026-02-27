import { create } from "zustand";

interface LivingTributeWizardState {
  honoreeName: string;
  honoreeEmail: string;
  honoreePhotoUri: string | null;
  title: string;
  description: string;
  occasion: string;
  occasionDate: string | null;
  privacy: string;
  isSurprise: boolean;
  coverPhotoUri: string | null;

  updateData: (data: Partial<Omit<LivingTributeWizardState, "updateData" | "reset">>) => void;
  reset: () => void;
}

const initialState = {
  honoreeName: "",
  honoreeEmail: "",
  honoreePhotoUri: null as string | null,
  title: "",
  description: "",
  occasion: "appreciation",
  occasionDate: null as string | null,
  privacy: "public",
  isSurprise: false,
  coverPhotoUri: null as string | null,
};

export const useLivingTributeWizardStore = create<LivingTributeWizardState>((set) => ({
  ...initialState,
  updateData: (data) => set((state) => ({ ...state, ...data })),
  reset: () => set(initialState),
}));
