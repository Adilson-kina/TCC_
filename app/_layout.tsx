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
        name="signup"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
      <Stack.Screen 
        name="termos"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
      <Stack.Screen 
        name="meta"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
      <Stack.Screen 
        name="restricao"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
      <Stack.Screen 
        name="perfil"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
      <Stack.Screen 
        name="home"
        options={{ 
          headerShown: false,
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
    </Stack>
  )
}
