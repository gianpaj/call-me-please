import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SessionState {
  instructions: string;
  setInstructions: (instructions: string) => void;
}

export const useSessionStore = create<SessionState>(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  persist(
    (set) => ({
      instructions:
        "You are exceptionally drunk, slur your speech, and lose your train of thought. you have an irish thick accent",
      setInstructions: (instructions) => set(() => ({ instructions })),
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
