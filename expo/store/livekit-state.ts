import type { Preset } from "../data/presets";
import { VoiceId } from "~/data/voices";
import { ModelId } from "./models";

export interface SessionConfig {
  model: ModelId;
  transcriptionModel: string;
  turnDetection: string;
  modalities: string;
  voice: VoiceId;
  temperature: number;
  maxOutputTokens: number | null;
  vadThreshold: number;
  vadSilenceDurationMs: number;
  vadPrefixPaddingMs: number;
}

export interface LiveKitState {
  sessionConfig: SessionConfig;
  userPresets: Preset[];
  selectedPresetId: string | null;
}

export const defaultSessionConfig: SessionConfig = {
  // FIXME: the client should not select the model, but the server should
  model: ModelId.gpt_4o_realtime,
  transcriptionModel: "whisper-1",
  // The model will automatically detect when the user has finished speaking and end the turn.
  turnDetection: "server_vad",
  modalities: "text_and_audio",
  voice: VoiceId.alloy,
  temperature: 0.8,
  maxOutputTokens: null,
  vadThreshold: 0.5,
  vadSilenceDurationMs: 200,
  vadPrefixPaddingMs: 300,
};

// Define the initial state
export const defaultLiveKitState: LiveKitState = {
  sessionConfig: { ...defaultSessionConfig },
  userPresets: [],
  selectedPresetId: "helpful-ai",
};
