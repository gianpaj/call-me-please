import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import type { LiveKitState } from "~/store/livekit-state";
// import { usePlaygroundState } from "./use-playground-state";
import { VoiceId } from "~/data/voices";
import {defaultLiveKitState} from "~/store/livekit-state";

export type ConnectFn = () => Promise<void>;

interface TokenGeneratorData {
  shouldConnect: boolean;
  wsUrl: string;
  token: string;
  defaultLiveKitState: LiveKitState;
  voice: VoiceId;
  disconnect: () => Promise<void>;
  connect: ConnectFn;
};

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

  // const { pgState, dispatch } = usePlaygroundState();


  const connect = async () => {
    const response = await fetch("/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(defaultLiveKitState),
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
