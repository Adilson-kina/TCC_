import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import post from '../components/post.tsx';

export default function Login() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = async () => {
    const data = { nome, email, senha };
    const response = await post(data);
    console.log(response);

    if (response && response.id) {
        await AsyncStorage.setItem('userId', response.id.toString()); // Salva o ID no armazenamento local
        router.navigate('/profile');
    }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>
      <View style={styles.form}>
        <View style={styles.items}>
          <Text style={styles.legenda}>Nome: </Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />
        </View>

        <View style={styles.items}>
          <Text style={styles.legenda}>Email: </Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} />
        </View>

        <View style={styles.items}>
          <Text style={styles.legenda}>Senha:</Text>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
        </View>

        <Pressable style={styles.butaum} onPress={handleSubmit} >
          <Text style={styles.bilhetin}>CADASTRAR</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title:{
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
  },

  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "lightpink",
  },

  items: {
    gap: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    padding: 1.5,
    borderWidth: 1,
    width: "60%",
    borderRadius: 4,
    borderColor: 'black',
  },

  butaum:{
    padding: 6,
    borderWidth: 2,
    marginTop: 20,
    margin: "auto",
    marginBottom: -30,
    borderRadius: 20,
    backgroundColor: "darkblue",
  },

  bilhetin:{
    fontSize: 13,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  legenda:{
    fontSize: 20,
    fontWeight: "bold",
  }
})
