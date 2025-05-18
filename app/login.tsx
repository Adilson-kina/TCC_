import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native"; // 🔹 Importação necessária
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import post from "../components/post.tsx";

export default function Login() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔹 Limpa os campos sempre que o usuário volta para esta tela
  useFocusEffect(
    useCallback(() => {
      setNome('');
      setEmail('');
      setSenha('');
      setErrorMessage('');
    }, [])
  );

  const handleSubmit = async () => {
    setErrorMessage(""); // Limpa qualquer erro anterior

    const data = isLogin ? { email, senha } : { nome, email, senha };
    const endpoint = isLogin ? "login" : "cadastro";
    const response = await post(data, endpoint);

    if (response && response.erro) {
      setErrorMessage(response.erro); // Exibir erro na tela
      return;
    }

    if (response && response.id) {
      await AsyncStorage.setItem("userId", response.id.toString());
      router.navigate("/profile");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Login" : "Cadastro"}</Text>
      <View style={styles.form}>
        {!isLogin && (
          <View style={styles.items}>
            <Text style={styles.legenda}>Nome:</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} />
          </View>
        )}

        <View style={styles.items}>
          <Text style={styles.legenda}>Email:</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} />
        </View>

        <View style={styles.items}>
          <Text style={styles.legenda}>Senha:</Text>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
        </View>

        {errorMessage !== "" && <Text style={styles.errorText}>{errorMessage}</Text>}  

        <Pressable style={styles.butaum} onPress={handleSubmit}>
          <Text style={styles.bilhetin}>{isLogin ? "ENTRAR" : "CADASTRAR"}</Text>
        </Pressable>

        <Pressable 
          onPress={() => {
            setIsLogin(!isLogin);
            setNome('');
            setEmail('');
            setSenha('');
            setErrorMessage('');
          }}
        >
          <Text style={styles.switchText}>
            {isLogin ? "Não tem uma conta? Cadastre-se!" : "Já tem uma conta? Faça login!"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "lightpink",
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  form: {
    gap: 10,
    padding: 50,
    borderWidth: 2,
    borderRadius: 30,
    backgroundColor: "lightblue",
    width: "90%",
    alignItems: "center",
  },
  items: {
    gap: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  input: {
    padding: 10,
    borderWidth: 1,
    width: "60%",
    borderRadius: 4,
    borderColor: "black",
    backgroundColor: "white",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 5,
    fontSize: 14,
  },
  butaum: {
    padding: 10,
    borderWidth: 2,
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: "darkblue",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  bilhetin: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  switchText: {
    textAlign: "center",
    color: "blue",
    marginTop: 20,
    textDecorationLine: "underline",
  },
  legenda: {
    fontSize: 20,
    fontWeight: "bold",
  },
});