import { useState } from "react";
import CheckBox from "expo-checkbox";
import { Link, router, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Select from "./select";
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
function heightPercent(percentage:number){
  return windowHeight * (percentage / 100);
}

function widthPercent(percentage:number){
  return windowWidth * (percentage / 100);
}

export default function Meta(){
    const [isChecked1, setChecked1] = useState(false);
    const [isChecked2, setChecked2] = useState(false);
    const [isChecked3, setChecked3] = useState(false);
    const [isChecked4, setChecked4] = useState(false);

    function prosseguir() {
        const isChecked = [isChecked1, isChecked2, isChecked3, isChecked4];
    
        if (isChecked.some(checked => checked)) {
            router.replace("/restricao");
        } else {
            alert("ESCOLHA ALGUMA DAS OPÇÕES ACIMA!");
        }
    }

    return(
        <View style={estilo.container}>
            <View>
                <Text style={estilo.title}>QUAL META VOCÊ DESEJA ALCANÇAR COM SUA DIETA?</Text>
            </View>
            <View style={estilo.selectContainer} >
              <Select label="Quero perder peso! 💪" onPress={() => setChecked1(!isChecked1)} style={estilo.select} />
              <Select label="Ganhar massa muscular! 🏋️‍♂️🚀" onPress={() => setChecked2(!isChecked2)} style={estilo.select} />
              <Select label="Quero comer melhor! 🌍✨" onPress={() => setChecked3(!isChecked3)} style={estilo.select} />
              <Select label="Manter meu peso! ➡️🔥" onPress={() => setChecked4(!isChecked4)} style={estilo.select} />
            </View>
            <View style={estilo.btnContainer}>
                <TouchableOpacity 
                    style={estilo.button}
                    onPressIn={() => {
                    prosseguir()
                }}>
                    <Text style={estilo.buttonText}>AVANÇAR!</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};

const estilo = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ecfcec',
  },

  title: {
    fontSize: 40,
    color: 'green',
    textAlign: 'center',
  },

  bloco: {
    padding: 5,
    marginTop: 5,
    width: widthPercent(100),
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: '#d4e4d4',
  },

  checkboxContainer: {
    width: widthPercent(100),
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  checkbox: {
    marginTop: 20,
    marginLeft: 10,
    borderRadius: 30,
    backgroundColor: 'white',
  },

  checkboxText: {
    flex: 1,
    marginTop: 20,
    marginLeft: 10,
  },

  btnContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },

  button: {
    width: 160,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 30,
    backgroundColor: 'green'
  },
  
  buttonText: {
    padding: 10,
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  selectContainer:{
    width: widthPercent(100),
    flex: 1,
    justifyContent: "space-around",
  },
});
