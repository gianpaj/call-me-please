import React, { createContext, useCallback, useContext, useState } from "react";

import type { LiveKitState } from "~/store/livekit-state";
import { VoiceId } from "~/data/voices";
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

const ConnectionContext = createContext<TokenGeneratorData | undefined>(
  undefined,
);

export const ConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [connectionDetails, setConnectionDetails] = useState<{
    wsUrl: string;
    token: string;
    shouldConnect: boolean;
    voice: VoiceId;
  }>({ wsUrl: "", token: "", shouldConnect: false, voice: VoiceId.alloy });

  const instructions = useSessionStore((state) => state.instructions);

  const connect = async () => {
    // FIXME: in production
    const response = await fetch("http://localhost:3000/api/livekit-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ instructions, ...defaultLiveKitState }),
    });

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
      // voice: pgState.sessionConfig.voice,
      voice: VoiceId.alloy,
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
