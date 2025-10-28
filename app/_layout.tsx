import { Stack } from "expo-router";

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
        name="perguntas_essenciais"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
      <Stack.Screen 
        name="perguntas_perfil"
        options={{ 
          title: "",
          headerStyle: {
            backgroundColor: "#ecfcec"
          },
          headerLeft: () => null // remove o botão de voltar
        }} 
      />
      <Stack.Screen 
        name="dieta"
        options={{ 
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
          headerStyle: {
            backgroundColor: "#ecfcec"
          }
        }} 
      />
      <Stack.Screen 
        name="editarPerfil"
        options={{ 
          title: "Editar Perfil",
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
