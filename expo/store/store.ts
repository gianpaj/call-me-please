import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SessionState {
  sessionAccessToken: string | null;
  setSessionAccessToken: (sessionAccessToken?: string) => void;
  apiKey: string | null;
  setApiKey: (apiKey?: string) => void;
  creditsLeft: number;
  decreaseCreditsLeft: () => void;
  setCreditsLeft: (creditsLeft: number) => void;
  instructions: string;
  setInstructions: (instructions: string) => void;
}

export const useSessionStore = create<SessionState>(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  persist(
    (set) => ({
      sessionAccessToken: null,
      apiKey: null,
      setApiKey: (apiKey) => set(() => ({ apiKey })),
      setSessionAccessToken: (sessionAccessToken) =>
        set(() => ({ sessionAccessToken })),
      creditsLeft: 5,
      decreaseCreditsLeft: () =>
        set((state) => ({ creditsLeft: state.creditsLeft - 1 })),
      setCreditsLeft: (creditsLeft) => set(() => ({ creditsLeft })),
      instructions:
        "You’re Arnold Schwarzenegger's brother. You have a very heavy accent Austrian accent. It's a really thick accent. You’re a body builder and you just woke me up to go to the gym. Motivate me to get out of bed.",
      setInstructions: (instructions) => set(() => ({ instructions })),
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
