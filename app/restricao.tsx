import React, { useState } from "react";
import { Link, router, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import CheckBoxWithLabel from './checkbox';

export default function Resticao(){
    const [isCheckedYes, setYes] = useState(false)
    const [isSickness1, setSickness1] = useState(false)
    const [isSickness2, setSickness2] = useState(false)
    const [isSickness3, setSickness3] = useState(false)
    const [isSickness4, setSickness4] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [isCheckedNo, setNo] = useState(false)
    const [isCheckedMaybe, setMaybe] = useState(false)
    const router = useRouter()

    function prosseguir(){
        const isChecked = [isCheckedYes, isCheckedNo, isCheckedMaybe];
        const checkedCount = isChecked.filter(Boolean).length
        const checkedSickness = [isSickness1, isSickness2, isSickness3, isSickness4, inputValue]
        const checkedCount2 = checkedSickness.filter(Boolean).length

        if (checkedCount == 1){
            if (isCheckedYes == true && checkedCount2 >= 1){
                var doenças = [checkedSickness.filter(String)]
                console.log(doenças)
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
    
            <CheckBoxWithLabel 
                label="Sim, tenho" 
                isChecked={isCheckedYes}
                onValueChange={(newValue) => {
                    setYes(newValue);
                    if (newValue) {
                        setNo(false);
                        setMaybe(false);
                    }
                    if (!newValue) {
                        setSickness1(false);
                        setSickness2(false);
                        setSickness3(false);
                        setSickness4(false);
                        setInputValue("");
                    }
                }}
                containerStyle={estilo.checkboxContainer}
                rowStyle={estilo.checkboxRow}
            />
    
            {isCheckedYes && (
                <View style={estilo.sicknessList}>
                    <CheckBoxWithLabel 
                        label="Doença Celíaca" 
                        isChecked={isSickness1}
                        onValueChange={setSickness1}
                        containerStyle={estilo.checkboxContainer}
                        rowStyle={estilo.checkboxRowNested}
                    />
                    <CheckBoxWithLabel 
                        label="Intolerância a Lactose" 
                        isChecked={isSickness2}
                        onValueChange={setSickness2}
                        containerStyle={estilo.checkboxContainer}
                        rowStyle={estilo.checkboxRowNested}
                    />
                    <CheckBoxWithLabel 
                        label="Diabetes" 
                        isChecked={isSickness3}
                        onValueChange={setSickness3}
                        containerStyle={estilo.checkboxContainer}
                        rowStyle={estilo.checkboxRowNested}
                    />
                    <CheckBoxWithLabel 
                        label="Intestino Irritável" 
                        isChecked={isSickness4}
                        onValueChange={setSickness4}
                        containerStyle={estilo.checkboxContainer}
                        rowStyle={estilo.checkboxRowNested}
                    />
                    <View style={estilo.textAreaContainer}>
                        <TextInput
                            style={estilo.textArea}
                            placeholder="Insira sua doença ou alergia!"
                            value={inputValue}
                            onChangeText={(text) => setInputValue(text)}
                        />
                    </View>
                </View>
            )}
    
            <CheckBoxWithLabel 
                label="Não, não tenho" 
                isChecked={isCheckedNo}
                onValueChange={(newValue) => {
                    setNo(newValue);
                    if (newValue) {
                        setYes(false);
                        setMaybe(false);
                        setSickness1(false);
                        setSickness2(false);
                        setSickness3(false);
                        setSickness4(false);
                        setInputValue("");
                    }
                }}
                containerStyle={estilo.checkboxContainer}
                rowStyle={estilo.checkboxRow}
            />
    
            <CheckBoxWithLabel 
                label="Não sei" 
                isChecked={isCheckedMaybe}
                onValueChange={(newValue) => {
                    setMaybe(newValue);
                    if (newValue) {
                        setYes(false);
                        setNo(false);
                        setSickness1(false);
                        setSickness2(false);
                        setSickness3(false);
                        setSickness4(false);
                        setInputValue("");
                    }
                }}
                containerStyle={estilo.checkboxContainer}
                rowStyle={estilo.checkboxRow}
            />
    
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
      marginBottom: 20,
    },

    checkboxContainer: {
      width: '100%',
      marginBottom: 5,
    },

    checkboxRow: {
      marginTop: 20,
      marginLeft: 10,
    },

    checkboxRowNested: {
      marginTop: 20,
      marginLeft: 50,
    },
  
    sicknessList: {
      width: '100%',
    },

    textAreaContainer: {
      width: '100%',
      marginTop: 10,
      paddingHorizontal: 10,
    },

    textArea: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 30,
        borderColor: '#2ecc71',
        backgroundColor: 'lightgray'
    },
  
    btnContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 20,
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
