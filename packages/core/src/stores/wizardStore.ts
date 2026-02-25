import { create } from "zustand";

interface WizardState {
  step: number;
  data: {
    firstName: string;
    lastName: string;
    middleName: string;
    nickname: string;
    dateOfBirth: string;
    dateOfDeath: string;
    relationship: string;
    relationshipDetail: string;
    personality: string;
    accomplishments: string;
    hobbies: string;
    favoriteMemories: string;
    profilePhotoUri: string | null;
    coverPhotoUri: string | null;
    privacy: "public" | "private" | "invited";
  };
  setStep: (step: number) => void;
  updateData: (partial: Partial<WizardState["data"]>) => void;
  reset: () => void;
}

const initialData: WizardState["data"] = {
  firstName: "",
  lastName: "",
  middleName: "",
  nickname: "",
  dateOfBirth: "",
  dateOfDeath: "",
  relationship: "",
  relationshipDetail: "",
  personality: "",
  accomplishments: "",
  hobbies: "",
  favoriteMemories: "",
  profilePhotoUri: null,
  coverPhotoUri: null,
  privacy: "public",
};

export const useWizardStore = create<WizardState>((set) => ({
  step: 0,
  data: { ...initialData },
  setStep: (step) => set({ step }),
  updateData: (partial) =>
    set((state) => ({ data: { ...state.data, ...partial } })),
  reset: () => set({ step: 0, data: { ...initialData } }),
}));
