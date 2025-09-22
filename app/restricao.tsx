import React, { useState } from "react";
import CheckBox from "expo-checkbox";
import { Picker } from '@react-native-picker/picker';
import { Link, router, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import CheckBoxWithLabel from './checkbox';

export default function Etapa3(){
    const [isCheckedYes, setYes] = useState(false)
    const [isSickness1, setSickness1] = useState(false)
    const [isSickness2, setSickness2] = useState(false)
    const [isSickness3, setSickness3] = useState(false)
    const [isSickness4, setSickness4] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [isCheckedNo, setNo] = useState(false)
    const [isCheckedMaybe, setMaybe] = useState(false)
    const [isChecked9, setChecked9] = useState(false)
    const router = useRouter()

    function prosseguir(){
        const isChecked = [isCheckedYes, isCheckedNo, isCheckedMaybe];
        const checkedCount = isChecked.filter(Boolean).length
        const checkedSickness =  [isSickness1, isSickness2, isSickness3, isSickness4, inputValue]
        const checkedCount2 = checkedSickness.filter(Boolean).length

        if (checkedCount == 1){
            if (isCheckedYes == true && checkedCount2 >= 1){
                var doenças = [checkedSickness.filter(String)]
                console.log(doenças)
                /*var doenças = [checkedSickness.map(sickness, index) => {
                    return sickness 
                }]*/
                router.replace("/etapa4")
            }else{
                router.replace("/etapa4")
            }
        }else if(checkedCount > 1){
            alert("SELECIONE UMA SÓ OPÇÃO!")
        }else if(checkedCount == 0){
            alert("ESCOLHA ALGUMA DAS OPÇÕES ACIMA!");
        }
    }

    return (
        <View style={estilo.container}>
            <View>
                <Text style={estilo.title}>VOCÊ POSSUI ALGUMA DOENÇA OU RESTRIÇÃO ALIMENTAR?</Text>
            </View>
    
            <View style={estilo.checkboxContainer}>
                <CheckBox
                    value={isCheckedYes}
                    onValueChange={(newValue) => {
                        setYes(newValue);
                        if (!newValue) {
                            setSickness1(false);
                        }
                    }}
                    style={estilo.checkbox}
                />
                <Text style={estilo.checkboxText}>Sim, tenho</Text>
            </View>

            <CheckBoxWithLabel label="Text showed" onPress={() => setSickness1(false)} />
    
            {isCheckedYes && (
                <View>
                    <View style={estilo.checkboxContainer}>
                        <CheckBox
                            value={isSickness1}
                            onValueChange={setSickness1}
                            style={estilo.checkboxInside}
                        />
                        <Text style={estilo.checkboxText}>Doença Celíaca</Text>
                    </View>
                    <View style={estilo.checkboxContainer}>
                        <CheckBox
                            value={isSickness2}
                            onValueChange={setSickness2}
                            style={estilo.checkboxInside}
                        />
                        <Text style={estilo.checkboxText}>Intolerância a Lactose</Text>
                    </View>
                    <View style={estilo.checkboxContainer}>
                        <CheckBox
                            value={isSickness3}
                            onValueChange={setSickness3}
                            style={estilo.checkboxInside}
                        />
                        <Text style={estilo.checkboxText}>Diabetes</Text>
                    </View>
                    <View style={estilo.checkboxContainer}>
                        <CheckBox
                            value={isSickness4}
                            onValueChange={setSickness4}
                            style={estilo.checkboxInside}
                        />
                        <Text style={estilo.checkboxText}>Intestino Irritável</Text>
                    </View>
                    <View>
                        <TextInput
                            style={estilo.textArea}
                            placeholder="Insira sua doença ou alergia!"
                            value={inputValue}
                            onChangeText={(text) => setInputValue(text)}
                        />
                    </View>
                </View>
            )}
    
            <View style={estilo.checkboxContainer}>
                <CheckBox
                    value={isCheckedNo}
                    onValueChange={(newValue) => {
                        setNo(newValue);
                        if (!newValue) {
                            setMaybe(false);
                        }
                    }}
                    style={estilo.checkbox}
                />
                <Text style={estilo.checkboxText}>Não, não tenho.</Text>
            </View>
    
            <View style={estilo.checkboxContainer}>
                <CheckBox
                    value={isCheckedMaybe}
                    onValueChange={(newValue) => {
                        setMaybe(newValue);
                        if (!newValue) {
                            setChecked9(false);
                        }
                    }}
                    style={estilo.checkbox}
                />
                <Text style={estilo.checkboxText}>Não sei.</Text>
            </View>
    
            <View style={estilo.btnContainer}>
                <TouchableOpacity 
                    style={estilo.button}
                    onPressIn={() => {
                        prosseguir();
                    }}>
                    <Text style={estilo.buttonText}>AVANÇAR!</Text>
                </TouchableOpacity>
            </View>
        </View>
    );    
};

const estilo = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
      backgroundColor: '#E0F7E9',
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
      borderWidth: 2,
      marginBottom: 20,
      borderRadius: 30,
      backgroundColor: 'lightgreen',
    },
  
    checkboxContainer: {
      width: '100%',
      marginBottom: 5,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
  
    checkbox: {
      marginTop: 20,
      marginLeft: 10,
      borderRadius: 30,
      backgroundColor: 'lightgray'
    },
  
    checkboxText: {
      flex: 1,
      marginTop: 20,
      marginLeft: 10,
    },

    checkboxInside: {
        marginTop: 20,
        marginLeft: 50,
        borderRadius: 30,
        backgroundColor: 'lightgray' 
    },

    textArea: {
        padding: 5,
        borderWidth: 2,
        borderRadius: 30,
        borderColor: 'black',
        backgroundColor: 'lightgray'
    },
  
    btnContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
  
    button: { 
      width: 160,
      borderWidth: 2,
      borderRadius: 10,
      paddingVertical: 3,
      paddingHorizontal: 30,
      backgroundColor: 'green',
    },
    
    buttonText: {
      padding: 5,
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
