import type { SessionConfig } from "../store/livekit-state";
import { defaultSessionConfig } from "../store/livekit-state";

export const enum LanguagePlayHT {
  AFRIKAANS = "afrikaans",
  ALBANIAN = "albanian",
  AMHARIC = "amharic",
  ARABIC = "arabic",
  BENGALI = "bengali",
  BULGARIAN = "bulgarian",
  CATALAN = "catalan",
  CROATIAN = "croatian",
  CZECH = "czech",
  DANISH = "danish",
  DUTCH = "dutch",
  ENGLISH = "english",
  FRENCH = "french",
  GALICIAN = "galician",
  GERMAN = "german",
  GREEK = "greek",
  HEBREW = "hebrew",
  HINDI = "hindi",
  HUNGARIAN = "hungarian",
  INDONESIAN = "indonesian",
  ITALIAN = "italian",
  JAPANESE = "japanese",
  KOREAN = "korean",
  MALAY = "malay",
  MANDARIN = "mandarin",
  POLISH = "polish",
  PORTUGUESE = "portuguese",
  RUSSIAN = "russian",
  SERBIAN = "serbian",
  SPANISH = "spanish",
  SWEDISH = "swedish",
  TAGALOG = "tagalog",
  THAI = "thai",
  TURKISH = "turkish",
  UKRAINIAN = "ukrainian",
  URDU = "urdu",
  XHOSA = "xhosa",
}

export interface Preset {
  id: string;
  name: string;
  description?: string;
  instructions: string;
  sessionConfig: SessionConfig;
  defaultGroup?: PresetGroup;
  icon?: React.ElementType;
  language: LanguagePlayHT;
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
    language: LanguagePlayHT.ENGLISH,
    // icon: Bot,
  },
];
