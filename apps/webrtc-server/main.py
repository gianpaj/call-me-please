from __future__ import annotations

import asyncio
import json
import logging
import uuid
from dataclasses import asdict, dataclass
from typing import Any, Dict, Literal
import os
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
    JobProcess,
)
from livekit.agents.multimodal import MultimodalAgent
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import openai, silero, playai

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("my-worker")
logger.setLevel(logging.INFO)


@dataclass
class SessionConfig:
    openai_api_key: str
    instructions: str
    voice: openai.realtime.api_proto.Voice
    temperature: float
    max_response_output_tokens: str | int
    modalities: list[openai.realtime.api_proto.Modality]
    turn_detection: openai.realtime.ServerVadOptions

    def __post_init__(self):
        if self.modalities is None:
            self.modalities = self._modalities_from_string("text_and_audio")  # type: ignore

    def to_dict(self):
        return {k: v for k, v in asdict(self).items() if k != "openai_api_key"}

    @staticmethod
    def _modalities_from_string(modalities: str) -> list[str]:
        modalities_map = {
            "text_and_audio": ["text", "audio"],
            "text_only": ["text"],
        }
        return modalities_map.get(modalities, ["text", "audio"])

    def __eq__(self, other: SessionConfig) -> bool:
        return self.to_dict() == other.to_dict()


def parse_session_config(data: Dict[str, Any]) -> SessionConfig:
    turn_detection = None

    if data.get("turn_detection"):
        turn_detection_json = json.loads(data.get("turn_detection"))
        turn_detection = openai.realtime.ServerVadOptions(
            threshold=turn_detection_json.get("threshold", 0.5),
            prefix_padding_ms=turn_detection_json.get("prefix_padding_ms", 200),
            silence_duration_ms=turn_detection_json.get("silence_duration_ms", 300),
        )
    else:
        turn_detection = openai.realtime.DEFAULT_SERVER_VAD_OPTIONS

    config = SessionConfig(
        openai_api_key=data.get("openai_api_key", ""),
        instructions=data.get("instructions", ""),
        voice=data.get("voice", "alloy"),
        temperature=float(data.get("temperature", 0.8)),
        max_response_output_tokens=data.get("max_output_tokens")  # by default is 'inf'
        if data.get("max_output_tokens") == "inf"
        else int(data.get("max_output_tokens") or 2048),
        modalities=SessionConfig._modalities_from_string(
            data.get("modalities", "text_and_audio")
        ),
        turn_detection=turn_detection,
    )
    return config


async def entrypoint_old(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()

    run_multimodal_agent(ctx, participant)

    logger.info("agent started")


def run_multimodal_agent(ctx: JobContext, participant: rtc.Participant):
    metadata = json.loads(participant.metadata)
    config = parse_session_config(metadata)

    logger.info(f"starting MultimodalAgent with config: {config.to_dict()}")

    if not config.openai_api_key:
        raise Exception("OpenAI API Key is required")

    model = openai.realtime.RealtimeModel(
        api_key=config.openai_api_key,
        instructions=config.instructions,
        voice=config.voice,
        temperature=config.temperature,
        model="gpt-4o-mini-realtime-preview",
        max_response_output_tokens=int(config.max_response_output_tokens),
        # input_audio_transcription=InputTranscriptionOptions(
        #     model=session["input_audio_transcription"]["model"],
        #     language=session["input_audio_transcription"].get("language"),
        #     prompt=session["input_audio_transcription"].get("prompt"),
        # ),
        modalities=config.modalities,
        turn_detection=config.turn_detection,
    )
    assistant = MultimodalAgent(model=model)
    assistant.start(ctx.room)
    session = model.sessions[0]

    if config.modalities == ["text", "audio"]:
        # session.conversation.item.create(
        #     llm.ChatMessage(
        #         role="user",
        #         # needs to be translated in Spanish, etc,?
        #         content="Please begin the interaction with the user in a manner consistent with your instructions.",
        #     )
        # )
        session.response.create()

    @ctx.room.local_participant.register_rpc_method("pg.updateConfig")
    async def update_config(
        data: rtc.rpc.RpcInvocationData,
    ):
        if data.caller_identity != participant.identity:
            return

        new_config = parse_session_config(json.loads(data.payload))
        if config != new_config:
            logger.info(
                f"config changed: {new_config.to_dict()}, participant: {participant.identity}"
            )
            session = model.sessions[0]
            session.session_update(
                instructions=new_config.instructions,
                voice=new_config.voice,
                temperature=new_config.temperature,
                max_response_output_tokens=new_config.max_response_output_tokens,
                turn_detection=new_config.turn_detection,
                modalities=new_config.modalities,
            )
            return json.dumps({"changed": True})
        else:
            return json.dumps({"changed": False})

    @session.on("response_done")
    def on_response_done(response: openai.realtime.RealtimeResponse):
        variant: Literal["warning", "destructive"]
        description: str | None = None
        title: str
        if response.status == "incomplete":
            if response.status_details and response.status_details["reason"]:
                reason = response.status_details["reason"]
                if reason == "max_output_tokens":
                    variant = "warning"
                    title = "Max output tokens reached"
                    description = "Response may be incomplete"
                elif reason == "content_filter":
                    variant = "warning"
                    title = "Content filter applied"
                    description = "Response may be incomplete"
                else:
                    variant = "warning"
                    title = "Response incomplete"
            else:
                variant = "warning"
                title = "Response incomplete"
        elif response.status == "failed":
            if response.status_details and response.status_details["error"]:
                error_code = response.status_details["error"]["code"]
                if error_code == "server_error":
                    variant = "destructive"
                    title = "Server error"
                elif error_code == "rate_limit_exceeded":
                    variant = "destructive"
                    title = "Rate limit exceeded"
                else:
                    variant = "destructive"
                    title = "Response failed"
            else:
                variant = "destructive"
                title = "Response failed"
        else:
            return

        asyncio.create_task(show_toast(title, description, variant))

    async def send_transcription(
        ctx: JobContext,
        participant: rtc.Participant,
        track_sid: str,
        segment_id: str,
        text: str,
        is_final: bool = True,
    ):
        transcription = rtc.Transcription(
            participant_identity=participant.identity,
            track_sid=track_sid,
            segments=[
                rtc.TranscriptionSegment(
                    id=segment_id,
                    text=text,
                    start_time=0,
                    end_time=0,
                    language="en",
                    final=is_final,
                )
            ],
        )
        await ctx.room.local_participant.publish_transcription(transcription)

    async def show_toast(
        title: str,
        description: str | None,
        variant: Literal["default", "success", "warning", "destructive"],
    ):
        await ctx.room.local_participant.perform_rpc(
            destination_identity=participant.identity,
            method="pg.toast",
            payload=json.dumps(
                {"title": title, "description": description, "variant": variant}
            ),
        )

    last_transcript_id = None

    # send three dots when the user starts talking. will be cleared later when a real transcription is sent.
    @session.on("input_speech_started")
    def on_input_speech_started():
        nonlocal last_transcript_id
        remote_participant = next(iter(ctx.room.remote_participants.values()), None)
        if not remote_participant:
            return

        track_sid = next(
            (
                track.sid
                for track in remote_participant.track_publications.values()
                if track.source == rtc.TrackSource.SOURCE_MICROPHONE
            ),
            None,
        )
        if last_transcript_id:
            asyncio.create_task(
                send_transcription(
                    ctx, remote_participant, track_sid, last_transcript_id, ""
                )
            )

        new_id = str(uuid.uuid4())
        last_transcript_id = new_id
        asyncio.create_task(
            send_transcription(
                ctx, remote_participant, track_sid, new_id, "…", is_final=False
            )
        )

    @session.on("input_speech_transcription_completed")
    def on_input_speech_transcription_completed(
        event: openai.realtime.InputTranscriptionCompleted,
    ):
        nonlocal last_transcript_id
        if last_transcript_id:
            remote_participant = next(iter(ctx.room.remote_participants.values()), None)
            if not remote_participant:
                return

            track_sid = next(
                (
                    track.sid
                    for track in remote_participant.track_publications.values()
                    if track.source == rtc.TrackSource.SOURCE_MICROPHONE
                ),
                None,
            )
            asyncio.create_task(
                send_transcription(
                    ctx, remote_participant, track_sid, last_transcript_id, ""
                )
            )
            last_transcript_id = None

    @session.on("input_speech_transcription_failed")
    def on_input_speech_transcription_failed(
        event: openai.realtime.InputTranscriptionFailed,
    ):
        nonlocal last_transcript_id
        if last_transcript_id:
            remote_participant = next(iter(ctx.room.remote_participants.values()), None)
            if not remote_participant:
                return

            track_sid = next(
                (
                    track.sid
                    for track in remote_participant.track_publications.values()
                    if track.source == rtc.TrackSource.SOURCE_MICROPHONE
                ),
                None,
            )

            error_message = "⚠️ Transcription failed"
            asyncio.create_task(
                send_transcription(
                    ctx,
                    remote_participant,
                    track_sid,
                    last_transcript_id,
                    error_message,
                )
            )
            last_transcript_id = None


async def entrypoint(ctx: JobContext):
    logger.info(f"connecting to room {ctx.room.name}")
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()

    metadata = json.loads(participant.metadata)
    config = parse_session_config(metadata)

    logger.info(f"starting with config: {config.to_dict()}")

    # fnc_ctx = AssistantFnc()  # create our fnc ctx instance
    initial_chat_ctx = llm.ChatContext().append(
        text=config.instructions,
        role="system",
    )
    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],  # there's a better one...
        # stt=None,
        stt=openai.STT(),
        llm=openai.LLM(),
        # https://github.com/livekit/agents/blob/8962d736325af87f9ce315d853fe92864c42720b/livekit-plugins/livekit-plugins-playai/livekit/plugins/playai/tts.py
        tts=playai.TTS(
            # voice=os.environ.get('PLAYHT_VOICE'), # type: ignore
            # language=config.language
            language="english",
            model="Play3.0-mini-ws",
            # word_tokenizer
        ),
        # fnc_ctx=fnc_ctx,
        chat_ctx=initial_chat_ctx,
    )

    # Start the assistant. This will automatically publish a microphone track and listen to the participant.
    agent.start(ctx.room, participant)
    # await agent.say(
    #     "Hello from the weather station. Would you like to know the weather? If so, tell me your location."
    # )


def prewarm_process(proc: JobProcess):
    # preload silero VAD in memory to speed up session start
    proc.userdata["vad"] = silero.VAD.load()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint_old,
            prewarm_fnc=prewarm_process,
            # worker_type=WorkerType.ROOM
        )
    )
