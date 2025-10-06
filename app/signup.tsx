import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import post from '../components/post.tsx';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

function getHeightPercent(percentage:number){
  return screenHeight * (percentage / 100);
}

function getWidthPercent(percentage:number){
  return screenWidth * (percentage / 100);
}

export default function SignUp() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    const data = { nome, email, senha };
    const response = await post(data, "cadastro");
    if (response && response.erro) {
      setErrorMessage(response.erro);
      window.alert(response.erro); // medida provisoria
      return;
    }
     
    if (response && response.id) {
      await AsyncStorage.setItem("userId", response.id.toString());
      router.navigate("/termos");
    }

    router.navigate('/termos');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicie sua jornada rumo a uma alimentação saudável e um estado emocional equilibrado</Text>
      <View style={styles.form}> {/* FORM*/ }
        <View style={styles.items}>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" />
        </View>

        <View style={styles.items}>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
        </View>

        <View style={styles.items}>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry placeholder="Senha" />
        </View>

        <Pressable style={styles.button} onPress={handleSubmit} >
          <Text style={styles.buttonText}>Cadastrar</Text>
        </Pressable>
      </View>
      <View style={styles.goto}>
        <Text style={styles.gotoText}>Já possui uma conta? </Text>
        <Link href="/" style={styles.gotoTextLink}><Text>Entrar</Text></Link>
      </View>
      <Link href="/termos"><Text>test</Text></Link>
    </View>
  );
}

const styles = StyleSheet.create({
  logo:{
    height: 210,
    width: 400,
    marginTop: getHeightPercent(10),
    marginBottom: getHeightPercent(10),
  },
  gotoTextLink:{
    fontSize: getHeightPercent(2),
    color: "#3392FF",
  },
  gotoText:{
    fontSize: getHeightPercent(2),
  },
  goto:{
    flexDirection: "row",
  },
  title:{
    fontSize: getHeightPercent(5),
    fontWeight: "bold",
    color: "#088c1c",
  },

  form: {
    alignItems: "center",
    gap: 25,
    padding: 50,
    width: getWidthPercent(100),
  },

  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#ecfcec",
  },

  items: {
    gap: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    padding: 20,
    height: getHeightPercent(4),
    width: getWidthPercent(90),
    borderRadius: 15,
    backgroundColor: "#dadada",
    color: "#747474",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },

  button:{
    padding: 6,
    width: getWidthPercent(65),
    height: getHeightPercent(5),
    marginTop: 20,
    margin: "auto",
    borderRadius: 20,
    backgroundColor: "#007912",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText:{
    fontSize: getHeightPercent(3),
    color: "white",
    fontWeight: "bold",
  },

  legenda:{
    fontSize: 20,
    fontWeight: "bold",
  }
})
