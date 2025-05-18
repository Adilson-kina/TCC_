import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import get from '../components/get.tsx';
import post from '../components/post.tsx';

export default function Profile() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        setErrorMessage("");

        const userId = await AsyncStorage.getItem('userId');

        if (!userId) {
          setErrorMessage("Nenhum ID encontrado.");
          setLoading(false);
          return;
        }

        const userData = await get({ id: parseInt(userId) });

        if (!userData || userData.erro) {
          setErrorMessage("Não foi possível carregar os dados do usuário.");
        } else {
          setNome(userData.nome);
          setEmail(userData.email);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setErrorMessage("Ocorreu um erro ao buscar os dados.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleDeleteAccount = async () => {
    setErrorMessage(""); // Limpa qualquer erro anterior

    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      setErrorMessage("Usuário não identificado!");
      return;
    }

    if (!senhaConfirmacao) {
      setErrorMessage("Digite sua senha para confirmar!");
      return;
    }

    const response = await post({ id: parseInt(userId), senha: senhaConfirmacao }, "delete");

    if (response && response.mensagem) {
      Alert.alert("Sucesso", "Conta deletada com sucesso!");

      // 🔹 Removendo ID do armazenamento local
      await AsyncStorage.removeItem('userId'); 

      // 🔹 Redirecionando para a tela inicial
      router.navigate("/");
    } else {
      setErrorMessage(response.erro || "Senha incorreta!");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#24273a" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <Image source={require('../assets/images/Icon.webp')} style={styles.icon} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{nome}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>
      </View>
      <View style={styles.center}>
        <TextInput
          style={styles.input}
          placeholder="Confirme sua senha"
          secureTextEntry
          value={senhaConfirmacao}
          onChangeText={setSenhaConfirmacao}
        />
        
        {errorMessage !== "" && <Text style={styles.errorText}>{errorMessage}</Text>} 

        <Pressable style={styles.button} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Deletar Conta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c6a0f6",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  center: {
    backgroundColor: "#f5bde6",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    color: "#24273a",
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: "white",
    fontSize: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "red",
    width: "50%",
    height: 50,
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#24273a",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  imageContainer: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 100,
    backgroundColor: "#c6a0f6",
    paddingHorizontal: 10,
    paddingTop: 10,
    borderBottomWidth: 2,
    borderColor: "#24273a",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 10,
  },
  userName: {
    paddingTop: 8,
    color: "#24273a",
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    paddingBottom: 8,
    color: "#24273a",
    fontSize: 16,
  },
  icon: {
    width: 80,
    height: 80,
    backgroundColor: "#ed8796",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "#24273a",
  },
});