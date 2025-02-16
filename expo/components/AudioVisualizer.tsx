import {
  useLocalParticipant,
  useMaybeTrackRefContext,
  useTracks,
  useVoiceAssistant,
} from "@livekit/components-react";
import type {
  AgentState,
  TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
// import { BarVisualizer, useMultibandTrackVolume } from "@livekit/react-native";
import { useBarAnimator, useMultibandTrackVolume } from "@livekit/react-native";
import {
  type LocalAudioTrack,
  LocalParticipant,
  type RemoteAudioTrack,
  RemoteParticipant,
  Track,
} from "livekit-client";
import { useEffect, useRef } from "react";
import {
  Animated,
  type ColorValue,
  type DimensionValue,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

const sequencerIntervals = new Map<AgentState, number>([
  ["connecting", 2000],
  ["initializing", 2000],
  ["listening", 500],
  ["thinking", 150],
]);

const getSequencerInterval = (
  state: AgentState | undefined,
  barCount: number,
): number | undefined => {
  if (state === undefined) {
    return 1000;
  }
  let interval = sequencerIntervals.get(state);
  if (interval) {
    switch (state) {
      case "connecting":
        // case 'thinking':
        interval /= barCount;
        break;

      default:
        break;
    }
  }
  return interval;
};

export const AudioVisualizer = () => {
  const { agent, state, audioTrack, agentTranscriptions, agentAttributes } =
    useVoiceAssistant();

  // const trackVolume = useTrackVolume();
  // const volumeBands = useMultibandTrackVolume(audioTrack, {
  //   bands: 15,
  //   loPass: 100,
  //   hiPass: 200,
  // });
  const minHeight = 20;
  const maxHeight = 50;

  // const { _connectionQuality } = agent.participantInfo;
  //

  const tracks = useTracks();
  // const localTracks = tracks.filter(
  //   ({ participant }) => participant instanceof LocalParticipant,
  // );
  const remoteTracks = tracks.filter(
    ({ participant }) => participant instanceof RemoteParticipant,
  );
  // const localMicTrack = localTracks.find(
  //   ({ source }) => source === Track.Source.Microphone,
  // );
  const remoteMicTrack = remoteTracks.find(
    ({ source }) => source === Track.Source.Microphone,
  );

  const { microphoneTrack, localParticipant } = useLocalParticipant();
  // localParticipant.lastMicrophoneError
  const localMultibandVolume = useMultibandTrackVolume(
    microphoneTrack?.audioTrack,
    { bands: 9 },
  );

  // console.log({ state, volumeBands });
  // console.log({ agent, agentTranscriptions, agentAttributes });
  return (
    <View
      style={{
        maxHeight: 75,
        width: "60%",
        marginBottom: 20,
        flex: 1,
        alignSelf: "center",
      }}
    >
      <BarVisualizer
        style={{
          flex: 1,
          opacity: state === "disconnected" ? 0.5 : 1,
        }}
        state={state}
        barCount={5}
        trackRef={remoteMicTrack}
        // trackRef={audioTrack}
        // options={{ minHeight, maxHeight }}
      />
      <BarVisualizer
        style={{
          flex: 1,
          opacity: state === "disconnected" ? 0.5 : 1,
        }}
        state={state}
        barCount={9}
        options={{ barWidth: 9 }}
        trackRef={microphoneTrack?.audioTrack}
        // trackRef={audioTrack}
        // options={{ minHeight, maxHeight }}
      />
    </View>
  );
};

import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export type BarVisualizerOptions = {
  /** decimal values from 0 to 1 */
  maxHeight?: number;
  /** decimal values from 0 to 1 */
  minHeight?: number;

  barColor?: ColorValue;
  barWidth?: DimensionValue;
  barBorderRadius?: number;
};

const defaultBarOptions = {
  maxHeight: 1,
  minHeight: 0.2,
  barColor: "#888888",
  barWidth: 24,
  barBorderRadius: 12,
} as const satisfies BarVisualizerOptions;

/**
 * @beta
 */
export interface BarVisualizerProps {
  /** If set, the visualizer will transition between different voice assistant states */
  state?: AgentState;
  /** Number of bars that show up in the visualizer */
  barCount?: number;
  trackRef?: LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder;
  options?: BarVisualizerOptions;
  /**
   * Custom React Native styles for the container.
   */
  style?: ViewStyle;
}

export const BarVisualizer = ({
  style = {},
  state,
  barCount = 5,
  trackRef,
  options,
}: BarVisualizerProps) => {
  // let trackReference: LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder = useMaybeTrackRefContext();

  // if (trackRef) {
  //   trackReference = trackRef;
  // }

  let magnitudes = useMultibandTrackVolume(trackRef, {
    bands: barCount,
  });

  const opts = { ...defaultBarOptions, ...options };

  // const highlightedIndices = useBarAnimator(
  //   state,
  //   barCount,
  //   getSequencerInterval(state, barCount) ?? 100,
  // );

  // Create a shared value that holds an array of opacities for each bar.
  // Each value is initialized at 0.3.
  // const opacities = useSharedValue<number[]>(new Array(barCount).fill(0.3));

  // Create an array of animated styles outside the loop
  // const animatedStyles = Array.from({ length: barCount }, (_, index) =>
  //   useAnimatedStyle(
  //     () => ({
  //       opacity: opacities.value[index],
  //     }),
  //     [opacities.value],
  //   ),
  // );

  // Whenever highlightedIndices changes, update the opacities array with a timing animation.
  // useEffect(() => {
  //   opacities.value = opacities.value.map((_, index) =>
  //     highlightedIndices.includes(index)
  //       ? withTiming(1, { duration: 250 })
  //       : withTiming(0.3, { duration: 250 }),
  //   );
  // }, [highlightedIndices]);

  const bars: React.ReactNode[] = [];

  const barStyle = {
    backgroundColor: opts.barColor,
    borderRadius: opts.barBorderRadius,
    width: opts.barWidth,
  };

  magnitudes =
    magnitudes.length === 0 ? new Array(barCount).fill(0.9) : magnitudes;
  magnitudes.forEach((value, index) => {
    const coerced = Math.min(opts.maxHeight, Math.max(opts.minHeight, value));
    const coercedPercent = Math.min(100, Math.max(0, coerced * 100 + 5));

    bars.push(
      <Reanimated.View
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        key={index}
        style={[
          { height: `${coercedPercent}%` },
          barStyle,
          styles.volumeIndicator,
          // animatedStyles[index],
        ]}
      />,
    );
  });

  return <View style={{ ...style, ...styles.container }}>{bars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  volumeIndicator: {
    borderRadius: 12,
  },
});
