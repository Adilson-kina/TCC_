import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Image, // ← ADICIONE
  Keyboard, // ← ADICIONE
  KeyboardAvoidingView, // ← ADICIONE
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput, // ← ADICIONE
  TouchableWithoutFeedback,
  View
} from "react-native";
import post from '../components/post';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
function heightPercent(percentage:number){
  return windowHeight * (percentage / 100);
}

function widthPercent(percentage:number){
  return windowWidth * (percentage / 100);
}

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    setErrorMessage("");

    const data = { email, senha };
    
    try {
      const response = await post(data, "login");

      if (response && response.erro) {
        setErrorMessage(response.erro);
        return;
      }
      
      if (response && response.token) { 
        await AsyncStorage.setItem("token", response.token);
        await AsyncStorage.setItem("userId", response.id.toString());
        router.navigate("/home"); 
      }
    } catch (error) {
      setErrorMessage("Erro ao conectar com o servidor. Tente novamente.");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Image 
            style={styles.logo}
            source={require("./../assets/images/Logo.png")}
          />
          
          {errorMessage !== "" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
          
          <View style={styles.form}>
            <View style={styles.items}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail} 
                placeholder="Email"
                placeholderTextColor="#888"
                returnKeyType="next"
              />
            </View>

            <View style={styles.items}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                value={senha} 
                onChangeText={setSenha} 
                secureTextEntry 
                placeholder="Senha"
                placeholderTextColor="#888"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            <Pressable style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Entrar</Text>
            </Pressable>
          </View>
          
          <View style={styles.goto}>
            <Text style={styles.gotoText}>Não possui cadastro? </Text>
            <Link href="/signup">
              <Text style={styles.gotoTextLink}>Registre-se</Text>
            </Link>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfcec",
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 280,              // ← Tamanho fixo responsivo
    height: 160,             // ← Tamanho fixo responsivo
    resizeMode: 'contain',
    marginBottom: 40,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  form: {
    width: '100%',
    alignItems: "center",
    gap: 15,                 // ← Reduzido
    marginBottom: 20,
  },
  items: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#dadada",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: "#000000",
    fontSize: 16,
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 20,
    backgroundColor: "#007912",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  goto: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  gotoText: {
    fontSize: 16,
    color: "#333",
  },
  gotoTextLink: {
    fontSize: 16,
    color: "#3392FF",
    fontWeight: "600",
  },
});