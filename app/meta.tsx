import { useState } from "react";
import CheckBox from "expo-checkbox";
import { Link, router, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Select from "./select";

export default function Etapa2(){
    const [isChecked1, setChecked1] = useState(false);
    const [isChecked2, setChecked2] = useState(false);
    const [isChecked3, setChecked3] = useState(false);
    const [isChecked4, setChecked4] = useState(false);

    function prosseguir() {
        const isChecked = [isChecked1, isChecked2, isChecked3, isChecked4];
    
        if (isChecked.some(checked => checked)) {
            router.replace("/meta");
        } else {
            alert("ESCOLHA ALGUMA DAS OPÇÕES ACIMA!");
        }
    }

    return(
        <View style={estilo.container}>
            <View>
                <Text style={estilo.title}>QUAL META VOCÊ DESEJA ALCANÇAR COM SUA DIETA?</Text>
            </View>
            <Select label="Quero perder peso! 💪" onPress={() => setChecked1(!isChecked1)} />
            <Select label="Ganhar massa muscular! 🏋️‍♂️🚀" />
            <Select label="Quero comer melhor! 🌍✨" />
            <Select label="Manter meu peso! ➡️🔥" />

            <View style={estilo.bloco}>
                <View style={estilo.checkboxContainer}>
                    <CheckBox
                        value={isChecked1}
                        style={estilo.checkbox}
                        onValueChange={setChecked1}/>
                    <Text style={estilo.checkboxText}>Quero perder peso! 💪</Text>
                </View>
            </View>

            <View style={estilo.bloco}>
                <View style={estilo.checkboxContainer}>
                    <CheckBox
                        value={isChecked2}
                        style={estilo.checkbox}
                        onValueChange={setChecked2}/>
                    <Text style={estilo.checkboxText}>Ganhar massa muscular! 🏋️‍♂️🚀</Text>
                </View>
            </View>

            <View style={estilo.bloco}>
                <View style={estilo.checkboxContainer}>
                    <CheckBox
                        value={isChecked3}
                        style={estilo.checkbox}
                        onValueChange={setChecked3}/>
                    <Text style={estilo.checkboxText}>Quero comer melhor! 🌍✨</Text>
                </View>
            </View>

            <View style={estilo.bloco}>
                <View style={estilo.checkboxContainer}>
                    <CheckBox
                        value={isChecked4}
                        style={estilo.checkbox}
                        onValueChange={setChecked4}/>
                    <Text style={estilo.checkboxText}>Manter meu peso! ➡️🔥</Text>
                </View>
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
    width: '100%',
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: '#d4e4d4',
  },

  checkboxContainer: {
    width: '100%',
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
    justifyContent: 'center',
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
    padding: 5,
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
