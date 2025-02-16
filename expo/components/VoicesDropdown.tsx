// import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAudioPlayer } from "expo-audio";
import _assign from "lodash/assign";
import _get from "lodash/get";
import _isEqual from "lodash/isEqual";
import React, { useCallback, useReducer, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import { VoiceId } from "~/data/voices";

const EXPO_PUBLIC_API_SERVER = process.env.EXPO_PUBLIC_API_SERVER;

interface VoiceOption {
  label: VoiceId;
  value: VoiceId;
}

interface Props {
  voices: VoiceOption[];
  currentVoice?: VoiceId;
  setVoice: (voice: VoiceId) => void;
  playVoice: (voice: VoiceId) => void;
}

const VoicesDropdown = ({
  voices,
  currentVoice,
  setVoice,
  // playVoice,
}: Props) => {
  const [voicePlaying, setVoicePlaying] = useState<VoiceId>();
  const [isFocus, setIsFocus] = useState(false);
  const player = useAudioPlayer(
    `${EXPO_PUBLIC_API_SERVER}/openai-voices/${VoiceId.ash}.mp3`,
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const togglePlaySound = (voice: VoiceId) => {
    try {
      if (player.playing && voicePlaying === voice) {
        player.pause();
        forceUpdate();
        return;
      }
      player.pause();
      setVoicePlaying(voice);
      player.replace({
        uri: `${EXPO_PUBLIC_API_SERVER}/openai-voices/${voice}.mp3`,
      });
      player.play();
      forceUpdate();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const renderLabel = () => {
    if (currentVoice || isFocus) {
      return (
        <Text className="bg-background" style={styles.label}>
          Voice
        </Text>
      );
    }
    return null;
  };

  // const _renderItem = useCallback(
  //   ({ item, index }: { item: any; index: number }) => {
  //     const isSelected = currentValue && _get(currentValue, valueField);
  //     const selected = _isEqual(_get(item, valueField), isSelected);
  //     _assign(item, { _index: index });
  //     const activeColor = '#F6F7F8'
  //     return (
  //       <TouchableOpacity
  //         key={index.toString()}
  //         testID={_get(item, itemTestIDField || labelField)}
  //         // accessible={!!accessibilityLabel}
  //         // accessibilityLabel={_get(
  //         //   item,
  //         //   itemAccessibilityLabelField || labelField
  //         // )}
  //         underlayColor={activeColor}
  //         onPress={() => onSelect(item)}
  //       >
  //         <View
  //           style={StyleSheet.flatten([
  //             itemContainerStyle,
  //             selected && {
  //               backgroundColor: activeColor,
  //             },
  //           ])}
  //         >
  //           {renderItem ? (
  //             renderItem(item, selected)
  //           ) : (
  //             <View style={styles.item}>
  //               <Text
  //                 style={StyleSheet.flatten([
  //                   styles.textItem,
  //                   itemTextStyle,
  //                   font(),
  //                 ])}
  //               >
  //                 {_get(item, labelField)}
  //               </Text>
  //             </View>
  //           )}
  //         </View>
  //       </TouchableOpacity>
  //     );
  //   },
  //   [
  //     // accessibilityLabel,
  //     activeColor,
  //     currentValue,
  //     font,
  //     itemAccessibilityLabelField,
  //     itemContainerStyle,
  //     itemTestIDField,
  //     itemTextStyle,
  //     labelField,
  //     onSelect,
  //     renderItem,
  //     valueField,
  //   ]
  // );

  const renderItem = (item: VoiceOption) => {
    return (
      <View
        className={`my-2 flex-row items-center justify-between px-3 py-4 ${item.value === currentVoice ? "rounded border-y-[0.5px] border-gray-300 bg-white" : ""}`}
      >
        <Text className="text-lg">{item.label}</Text>

        <TouchableOpacity
          hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
          onPress={() => togglePlaySound(item.value)}
        >
          <FontAwesome
            style={styles.icon}
            color="black"
            name={
              item.value === voicePlaying && player.playing
                ? "stop-circle"
                : "play-circle"
            }
            size={24}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="pt-5">
      {renderLabel()}
      <Dropdown
        style={styles.dropdown}
        activeColor="#f2f2f2"
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={voices}
        containerStyle={styles.containerStyle}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={isFocus ? "..." : "Select item"}
        searchPlaceholder="Search..."
        value={currentVoice}
        renderItem={renderItem}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setVoice(item.value);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

export default VoicesDropdown;

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: "#f2f2f2",
  },
  dropdown: {
    height: 64,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    left: 0,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderWidth: 0,
  },
});
