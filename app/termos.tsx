import { useState } from "react";
import CheckBox from "expo-checkbox";
import { Link, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Text, View, Image, StyleSheet } from "react-native";

export default function Etapa1() {
  const [isChecked1, setChecked1] = useState(false)
  const [isChecked2, setChecked2] = useState(false)
  const router = useRouter();

  function prosseguir(){
      if(isChecked1 == true && isChecked2 == true){
        router.replace('/meta')
      }else if(isChecked1 == true || isChecked2 == true){
        alert("É NECESSÁRIO ACEITAR TODOS ACIMA!")
      }else{
        alert("PARA CONTINUARES, É NECESSÁRIO ACEITAR TODOS ACIMA!")
      }
  }

  return (
    <View style={estilo.container}>
      <View style={estilo.imageContainer}>
        <Image
          source={require(`./img/54.png`)}
          style={estilo.img}
        />
      </View>
      
      <View style={estilo.textContainer}>
        <Text style={estilo.title}>Dieta-se</Text>
        <Text style={estilo.subtitle}>Zelando sempre por sua privacidade e segurança</Text>
      </View>

      <View style={estilo.checkboxContainer}>
        <CheckBox
          value={isChecked1}
          onValueChange={setChecked1}
          style={estilo.checkbox}
        />
        <Text style={estilo.checkboxText}>
          Estou de acordo com a <Link href={".."} style={estilo.link}>Política de Privacidade</Link> e os <Link href={".."} style={estilo.link}>Termos de Uso</Link>.
        </Text>
      </View>

      <View style={estilo.checkboxContainer}>
        <CheckBox
          value={isChecked2}
          onValueChange={setChecked2}
          style={estilo.checkbox}
        />
        <Text style={estilo.checkboxText}>
          Autorizo o processamento dos meus dados pessoais de saúde para acessar os recursos da aplicação Dieta-se. Saiba mais na <Link href={".."} style={estilo.link}>Política de Privacidade</Link>.
        </Text>
      </View>

      <View style={estilo.btnContainer}>
        <TouchableOpacity 
        style={estilo.button}
        onPressIn={() => {
          prosseguir()
        }}>
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
    justifyContent: 'flex-end',
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
    fontSize: 15,
    textAlign: 'center',
  },

  checkboxContainer: {
    width: '100%',
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  checkbox: {
    marginTop: 3,
    marginRight: 10,
    borderRadius: 30,
  },

  checkboxText: {
    flex: 1,
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
