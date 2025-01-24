import type { Track } from "livekit-client";
import { useEffect, useState } from "react";

export const useTrackVolume = (track?: Track) => {
  const [volume, setVolume] = useState(0);
  useEffect(() => {
    if (!track?.mediaStream) {
      return;
    }

    const mediaStream = track.mediaStream as unknown as MediaStream;
    const audioTrack = mediaStream.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    let isMounted = true;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animationFrameId: number;

    const setupAudio = () => {
      // Dynamically import AudioContext (unsupported in React Native)
      try {
        // Use a polyfill or a native module if available
        // For demonstration, this will not work in React Native without a polyfill
        const AudioContextConstructor =
          (global as any).AudioContext || (global as any).webkitAudioContext;
        if (!AudioContextConstructor) {
          console.warn("AudioContext is not available");
          return;
        }
        audioContext = new AudioContextConstructor();
        source = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        analyser.smoothingTimeConstant = 0;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        const updateVolume = () => {
          if (analyser && dataArray && isMounted) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (const a of dataArray) {
              sum += a * a;
            }
            const rms = Math.sqrt(sum / dataArray.length);
            const normalizedVolume = rms / 255;
            setVolume(normalizedVolume);
            animationFrameId = requestAnimationFrame(updateVolume);
          }
        };

        updateVolume();
      } catch (error) {
        console.error("AudioContext setup failed:", error);
      }
    };

    setupAudio();

    return () => {
      isMounted = false;
      if (audioContext) {
        audioContext.close();
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [track]);

  return volume;
};

const normalizeFrequencies = (frequencies: Float32Array) => {
  const normalizeDb = (value: number) => {
    const minDb = -100;
    const maxDb = -10;
    let db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100;
    db = Math.sqrt(db);

    return db;
  };

  // Normalize all frequency values
  return frequencies.map((value) => {
    if (value === -Infinity) {
      return 0;
    }
    return normalizeDb(value);
  });
};

export const useMultibandTrackVolume = (
  track?: Track,
  bands = 5,
  loPass = 100,
  hiPass = 600,
) => {
  const [frequencyBands, setFrequencyBands] = useState<Float32Array[]>([]);

  useEffect(() => {
    if (!track?.mediaStream) {
      return;
    }

    const mediaStream = track.mediaStream as unknown as MediaStream;
    const audioTrack = mediaStream.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    let isMounted = true;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Float32Array | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animationFrameId: number;
    // const fft = new FFT(2048);

    const normalizeFrequencies = (frequencies: Float32Array) => {
      const normalizeDb = (value: number) => {
        const minDb = -100;
        const maxDb = -10;
        let db = 1 - (Math.max(minDb, Math.min(maxDb, value)) * -1) / 100;
        db = Math.sqrt(db);
        return db;
      };

      return frequencies.map((value) =>
        value === -Infinity ? 0 : normalizeDb(value),
      );
    };

    const setupAudio = () => {
      try {
        const AudioContextConstructor =
          (global as any).AudioContext || (global as any).webkitAudioContext;
        if (!AudioContextConstructor) {
          console.warn("AudioContext is not available");
          return;
        }
        audioContext = new AudioContextConstructor();
        source = audioContext.createMediaStreamSource(mediaStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Float32Array(bufferLength);

        const updateVolume = () => {
          if (analyser && dataArray && isMounted) {
            analyser.getFloatFrequencyData(dataArray);
            const frequencies: Float32Array = dataArray.slice(loPass, hiPass);
            const normalizedFrequencies = normalizeFrequencies(frequencies);

            // Split into bands
            const chunkSize = Math.ceil(normalizedFrequencies.length / bands);
            const chunks: Float32Array[] = [];
            for (let i = 0; i < bands; i++) {
              const start = i * chunkSize;
              const end = start + chunkSize;
              chunks.push(normalizedFrequencies.slice(start, end));
            }

            setFrequencyBands(chunks);
            animationFrameId = requestAnimationFrame(updateVolume);
          }
        };

        updateVolume();
      } catch (error) {
        console.error("AudioContext setup failed:", error);
      }
    };

    setupAudio();

    return () => {
      isMounted = false;
      if (audioContext) {
        audioContext.close();
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [track, loPass, hiPass, bands]);

  return frequencyBands;
};
