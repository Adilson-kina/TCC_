import { Stack } from "expo-router";
import { Text, View } from 'react-native';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          title: '',
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }}
      />
      <Stack.Screen 
        name="profile"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
      <Stack.Screen 
        name="login"
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }}
      />
      <Stack.Screen 
        name="signup"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
    </Stack>
  )
}
