import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{
          title: "",
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="signup"
        options={{ 
          title: "",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="termos"
        options={{ 
          title: "",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="perguntasEssenciais"
        options={{ 
          title: "",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="perguntasPerfil"
        options={{ 
          title: "",
          headerShown: false
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
      <Stack.Screen 
        name="verPerfil"
        options={{ 
          title: "",
          headerShown: false  // muda de true para false
        }} 
      />
      <Stack.Screen 
        name="editarPerfil"
        options={{ 
          title: "",
          headerShown: false  // muda de true para false
        }} 
      />
      <Stack.Screen 
        name="dieta"
        options={{ 
          title: "",
          headerShown: false  // ← MUDE PARA FALSE
        }} 
      />
      <Stack.Screen 
        name="refeicoes"
        options={{ 
          title: "",
          headerShown: false  // ← MUDE PARA FALSE
        }} 
      />
      <Stack.Screen 
        name="progresso"
        options={{ 
          title: "",
          headerShown: false  // ← MUDE PARA FALSE
        }} 
      />
      <Stack.Screen 
        name="calorias"
        options={{ 
          title: "",
          headerShown: false  // ← MUDE PARA FALSE
        }} 
      />
      <Stack.Screen 
        name="historico"
        options={{ 
          title: "",
          headerShown: false  // ← MUDE PARA FALSE
        }} 
      />
      <Stack.Screen 
        name="jejum"
        options={{ 
          title: "",
          headerShown: false  // ← MUDE PARA FALSE
        }} 
      />
    </Stack>
  )
}
