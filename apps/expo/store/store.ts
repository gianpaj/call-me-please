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
        "You’re Arnold Schwarzenegger's brother. Same exact heavy accent Austrian accent. It's really thick accent. You’re a body builder and you just woke me up to go to the gym. Motivate me to get out of bed.",
      setInstructions: (instructions) => set(() => ({ instructions })),
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
