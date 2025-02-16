/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AccessToken } from "livekit-server-sdk";

import { env } from "~/env";

// import { PlaygroundState } from "@/data/playground-state";

export async function POST(request: Request) {
  // TODO: fix this
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let callConfig: any;
  // let callConfig: LiveKitState;

  try {
    callConfig = await request.json();
  } catch (error) {
    return Response.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }
  // TODO: use Zod to validate callConfig

  const {
    instructions,
    sessionConfig: {
      turnDetection,
      modalities,
      voice,
      temperature,
      maxOutputTokens,
      vadThreshold,
      vadSilenceDurationMs,
      vadPrefixPaddingMs,
    },
  } = callConfig;

  const roomName = Math.random().toString(36).slice(7);
  const apiKey = env.LIVEKIT_API_KEY;
  const apiSecret = env.LIVEKIT_API_SECRET;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const at = new AccessToken(apiKey, apiSecret, {
    identity: "human",
    metadata: JSON.stringify({
      instructions,
      modalities,
      voice,
      temperature,
      max_output_tokens: maxOutputTokens,
      openai_api_key: env.OPENAI_API_KEY,
      turn_detection: JSON.stringify({
        type: turnDetection,
        threshold: vadThreshold,
        silence_duration_ms: vadSilenceDurationMs,
        prefix_padding_ms: vadPrefixPaddingMs,
      }),
    }),
  });
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
    canUpdateOwnMetadata: true,
  });
  return Response.json({
    accessToken: await at.toJwt(),
    url: env.LIVEKIT_URL,
  });
}
