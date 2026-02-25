import { create } from "zustand";

interface ChatState {
  activeRoomId: string | null;
  setActiveRoom: (roomId: string | null) => void;
  replyToMessage: { id: string; content: string | null; senderName: string } | null;
  setReplyTo: (msg: { id: string; content: string | null; senderName: string } | null) => void;
  isRecording: boolean;
  setIsRecording: (v: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeRoomId: null,
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  replyToMessage: null,
  setReplyTo: (msg) => set({ replyToMessage: msg }),
  isRecording: false,
  setIsRecording: (v) => set({ isRecording: v }),
}));
