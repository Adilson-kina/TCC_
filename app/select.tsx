import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label?: string;
  onPress?: () => void;
};

export default function Select({ label = "", onPress }: Props) {
  const [isChecked, setChecked] = useState(false);
  const size = 28;

  const handlePress = () => {
    setChecked(isChecked => !isChecked);
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={styles.block}>
      <View style={styles.row}>
        <Pressable
          onPress={handlePress}
          hitSlop={8}
          style={[
            styles.round,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: isChecked ? "#2ecc71" : "#999",
              backgroundColor: isChecked ? "#2ecc71" : "transparent",
            },
          ]}
        >
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
  block: {
    padding: 8,
    marginTop: 8,
    width: "100%",
    borderRadius: 30,
    backgroundColor: "#d4e4d4",
  },
  row: { flexDirection: "row", alignItems: "center" },
  round: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginRight: 10,
    borderWidth: 2,
  },
  label: { flex: 1 },
});
