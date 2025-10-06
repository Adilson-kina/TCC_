import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CheckBoxWithLabel( {label = ""} ) {
  const [isChecked, setChecked] = useState(false);
  const size = 30;

  return (
    <Pressable onPress={() => setChecked(isChecked => !isChecked)} style={styles.container}>
      <View style={styles.row}>
        <Pressable onPress={() => setChecked(isChecked => !isChecked)} style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: isChecked ? "#2ecc71" : "#999999",
            backgroundColor: isChecked ? "#2ecc71" : "transparent",
          }]}>
          {isChecked && (
            <Ionicons name="checkmark" size={size * 0.6} color="white" />
          )}
        </Pressable>

        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row:{
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox:{
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
