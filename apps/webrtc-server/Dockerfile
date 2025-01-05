# syntax=docker/dockerfile:1

# Use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

# Install the project into `/app`
WORKDIR /app

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

# Install the project's dependencies using the lockfile and settings
RUN --mount=type=cache,target=/root/.cache/uv \
  --mount=type=bind,source=uv.lock,target=uv.lock \
  --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
  uv sync --frozen --no-install-project --no-dev

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#user
ARG UID=10001
RUN adduser \
  --disabled-password \
  --gecos "" \
  --home "/home/appuser" \
  --shell "/sbin/nologin" \
  --uid "${UID}" \
  appuser


# Install gcc and other build dependencies.
RUN apt-get update && \
  apt-get install -y \
  gcc \
  python3-dev \
  && rm -rf /var/lib/apt/lists/*

USER appuser

RUN mkdir -p /home/appuser/.cache
RUN chown -R appuser /home/appuser/.cache

WORKDIR /home/appuser

COPY . .

# ensure that any dependent models are downloaded at build-time
RUN python main.py download-files

# Run the application.
ENTRYPOINT ["python", "main.py"]
CMD ["start"]
