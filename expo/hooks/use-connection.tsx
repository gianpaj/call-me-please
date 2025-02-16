import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

import { VoiceId, voices } from "~/data/voices";
import { SYSTEM_MESSAGES } from "~/src/prompts";
import type { LiveKitState } from "~/store/livekit-state";
import { defaultLiveKitState } from "~/store/livekit-state";
import { useSessionStore } from "~/store/store";

export type ConnectFn = () => Promise<void>;

interface TokenGeneratorData {
  shouldConnect: boolean;
  wsUrl: string;
  token: string;
  defaultLiveKitState: LiveKitState;
  voice: VoiceId;
  setVoice: (voice: VoiceId) => void;
  disconnect: () => void;
  connect: ConnectFn;
}

interface CallConfig extends LiveKitState {
  instructions: string;
}

const ConnectionContext = createContext<TokenGeneratorData | undefined>(
  undefined,
);

export const ConnectionProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [connectionDetails, setConnectionDetails] = useState<{
    wsUrl: string;
    token: string;
    shouldConnect: boolean;
    voice: VoiceId;
  }>({ wsUrl: "", token: "", shouldConnect: false, voice: VoiceId.ash });

  const instructions = useSessionStore((state) => state.instructions);

  const connect = async () => {
    // const timeString = "08:01 am";
    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const prompt = `${SYSTEM_MESSAGES.en({ currenTime: timeString })}\n${instructions}`;

    const body: CallConfig = {
      instructions: prompt,
      ...defaultLiveKitState,
      sessionConfig: {
        ...defaultLiveKitState.sessionConfig,
        voice: connectionDetails.voice,
      },
    };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_SERVER}/api/livekit-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch token");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { accessToken, url } = await response.json();

    setConnectionDetails({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      wsUrl: url,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      token: accessToken,
      shouldConnect: true,
      voice: connectionDetails.voice,
    });
  };

  const disconnect = useCallback(() => {
    setConnectionDetails((prev) => ({ ...prev, shouldConnect: false }));
  }, []);

  const setVoice = useCallback((voice: VoiceId) => {
    setConnectionDetails((prev) => ({ ...prev, voice }));
  }, []);

  return (
    <ConnectionContext.Provider
      value={{
        wsUrl: connectionDetails.wsUrl,
        token: connectionDetails.token,
        shouldConnect: connectionDetails.shouldConnect,
        voice: connectionDetails.voice,
        defaultLiveKitState,
        connect,
        disconnect,
        setVoice,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);

  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }

  return context;
};
