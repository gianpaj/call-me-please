import React, { useCallback, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import _assign from "lodash/assign";
import _get from "lodash/get";
import _isEqual from "lodash/isEqual";

import type { VoiceId } from "~/data/voices";

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
  playVoice,
}: Props) => {
  // const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (currentVoice || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: "blue" }]}>
          Dropdown label
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
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>

        <TouchableOpacity
          hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
          onPress={() => playVoice(item.value)}
        >
          <AntDesign
            style={styles.icon}
            color="black"
            name="playcircleo"
            size={24}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* {renderLabel()} */}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={voices}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Select item" : "..."}
        searchPlaceholder="Search..."
        value={currentVoice}
        renderItem={renderItem}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setVoice(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? "blue" : "black"}
            name="Safety"
            size={20}
          />
        )}
      />
    </View>
  );
};

export default VoicesDropdown;

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    // borderColor: "gray",
    // borderWidth: 0.5,
    // borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
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
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
});
