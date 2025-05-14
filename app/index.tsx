import { Text, View, StyleSheet, Pressable } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button}>
        <Link href="/login"> Login</Link>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c6a0f6',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  button:{
    backgroundColor: "#89b4fa",
    borderWidth: 1,
    borderColor: "#1e1e2e",
    width: "12%",
    height: "4%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: "5%",
  }
})
