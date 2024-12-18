import type { SessionConfig} from "../store/livekit-state";
import { defaultSessionConfig } from "../store/livekit-state";


export interface Preset {
  id: string;
  name: string;
  description?: string;
  instructions: string;
  sessionConfig: SessionConfig;
  defaultGroup?: PresetGroup;
  icon?: React.ElementType;
}

export enum PresetGroup {
  FUNCTIONALITY = "Use-Case Demos",
  PERSONALITY = "Fun Style & Personality Demos",
}

export const defaultPresets: Preset[] = [
  // Functionality Group
  {
    id: "helpful-ai",
    name: "Helpful AI",
    description:
      "A helpful and witty AI using the platform defaults, similar to ChatGPT Advanced Voice Mode.",
    instructions: `You're a motivational Austrain gymnastics champion who is also physical therapis`,
    sessionConfig: { ...defaultSessionConfig },
    defaultGroup: PresetGroup.FUNCTIONALITY,
    // icon: Bot,
  }
];
