import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CheckBoxWithLabel from './checkbox';

export default function Termos() {
  const [isChecked1, setChecked1] = useState(false);
  const [isChecked2, setChecked2] = useState(false);
  const router = useRouter();

  // ✅ Verifica se o token existe ao carregar a tela
  useEffect(() => {
    const verificarToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Sessão expirada", "Faça login novamente para continuar.");
        router.replace("/login");
      }
    };

    verificarToken();
  }, []);

  function prosseguir() {
    if (isChecked1 && isChecked2) {
      router.replace('/perguntas_essenciais');
    } else if (isChecked1 || isChecked2) {
      alert("É NECESSÁRIO ACEITAR TODOS ACIMA!");
    } else {
      alert("PARA CONTINUARES, É NECESSÁRIO ACEITAR TODOS ACIMA!");
    }
  }

  return (
    <View style={estilo.container}>
      <View style={estilo.imageContainer}>
        <Image
          source={require(`./img/logo.png`)}
          style={estilo.img}
        />
      </View>

      <View style={estilo.textContainer}>
        <Text style={estilo.title}>Dieta-se</Text>
        <Text style={estilo.subtitle}>Zelando sempre por sua privacidade e segurança</Text>
      </View>

      <View style={estilo.checkboxWrapper}>
        <CheckBoxWithLabel
          isChecked={isChecked1}
          onValueChange={setChecked1}
          label=""
          rowStyle={estilo.checkboxRow}
        />
        <Text style={estilo.checkboxText}>
          Estou de acordo com a <Link href={".."} style={estilo.link}>Política de Privacidade</Link> e os <Link href={".."} style={estilo.link}>Termos de Uso</Link>.
        </Text>
      </View>

      <View style={estilo.checkboxWrapper}>
        <CheckBoxWithLabel
          isChecked={isChecked2}
          onValueChange={setChecked2}
          label=""
          rowStyle={estilo.checkboxRow}
        />
        <Text style={estilo.checkboxText}>
          Autorizo o processamento dos meus dados pessoais de saúde para acessar os recursos da aplicação Dieta-se. Saiba mais na <Link href={".."} style={estilo.link}>Política de Privacidade</Link>.
        </Text>
      </View>

      <View style={estilo.btnContainer}>
        <TouchableOpacity
          style={estilo.button}
          onPressIn={prosseguir}
        >
          <Text style={estilo.buttonText}>Prosseguir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilo = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ecfcec',
  },
  imageContainer: {
    marginBottom: 20,
  },
  
  btnContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  img: {
    width: 200,
    height: 200,
  },
  
  textContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 50,
    color: 'green',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  checkboxWrapper: {
    width: '100%',
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxRow: {
    marginRight: 10,
  },
  checkboxText: {
    flex: 1,
    fontSize: 20,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: 'green',
  },
  
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  link: {
    color: 'green',
  }
});
