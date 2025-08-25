import React, { useState } from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import Checkbox from "expo-checkbox";

export default function Select({label = "Label", checked: controlledChecked, defaultChecked = false, onChange, containerStyle, labelStyle, checkboxStyle,}) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const value = isControlled ? controlledChecked : internalChecked;

  const toggle = () => {
    const newVal = !value;
    if (!isControlled) setInternalChecked(newVal);
    if (typeof onChange === "function") onChange(newVal);
  };

  return (
    <Pressable onPress={toggle} style={[styles.block, containerStyle]}>
      <View style={styles.row}>
        <Checkbox
          value={value}
          onValueChange={toggle}
          style={[styles.checkbox, checkboxStyle]}
        />
        <Text style={[styles.checkboxText, labelStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: {
    padding: 8,
    marginTop: 8,
    width: "100%",
    marginBottom: 12,
    borderRadius: 30,
    backgroundColor: "#d4e4d4",
  },
  row: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "white",
    marginLeft: 10,
    marginRight: 10,
  },
  checkboxText: {
    flex: 1,
  },
});
