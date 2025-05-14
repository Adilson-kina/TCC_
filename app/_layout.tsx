import { Stack } from "expo-router";
import { Text, View } from 'react-native';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Home',
          headerStyle: {
            backgroundColor: "#c6a0f6"
          }
        }}
      />
      <Stack.Screen 
        name="profile"
        options={{ 
          title: 'My Profile',
          headerStyle: {
            backgroundColor: "#c6a0f6"
          }
        }} 
      />
      <Stack.Screen 
        name="login"
        options={{
          title: "Login",
          headerStyle: {
            backgroundColor: "lightpink"
          }
        }}
      />
    </Stack>
  )
}
