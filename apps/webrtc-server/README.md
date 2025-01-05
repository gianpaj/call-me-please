# WebRTC Server (Livekit Agent)

Taken from: <https://github.com/livekit-examples/realtime-playground/tree/main/agent>

## Getting Started

```bash
uv .venv
uv sync
```

## Running the Server in development mode

```bash
python main.py dev
```

## Running the Server in production mode

```bash
python main.py start
```

## Deploy to Fly.io

```bash
flyctl deploy
```

## Resources

- <https://github.com/livekit/agents>
- <https://fly.io> - to deploy the Docker image
