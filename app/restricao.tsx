import { useState } from "react";
import CheckBox from "expo-checkbox";
import { Picker } from '@react-native-picker/picker';
import { Link, router, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Etapa3(){
    const [isChecked1, setChecked1] = useState(false)
    const [isChecked2, setChecked2] = useState(false)
    const [isChecked3, setChecked3] = useState(false)
    const [isChecked4, setChecked4] = useState(false)
    const [isChecked5, setChecked5] = useState(false)
    const [isChecked6, setChecked6] = useState(false)
    const [isChecked7, setChecked7] = useState(false)
    const [isChecked8, setChecked8] = useState(false)
    const [isChecked9, setChecked9] = useState(false)
    const [isChecked10, setChecked10] = useState(false)
    const [isChecked11, setChecked11] = useState(false)
    const [isChecked12, setChecked12] = useState(false)
    const [selectedValue, setSelectedValue] = useState("none")
    const [showPicker, setShowPicker] = useState(false)
    const router = useRouter()

    function prosseguir(){
        //router.replace('/etapa2')
        alert("BANANA COM MEL")
    }

    return(
        <View style={estilo.container}>
            <View>
                <Text style={estilo.title}>VOCÊ POSSUI ALGUMA DOENÇA OU RESTRIÇÃO ALIMENTAR?</Text>
            </View>

            <View style={estilo.checkboxContainer}>
                <CheckBox
                value={isChecked1}
                onValueChange={(newValue) =>{
                    setChecked1(newValue)
                    if(!newValue){
                        setChecked2(false)
                    }
                }}
                style={estilo.checkbox}
                />
                <Text style={estilo.checkboxText}>Sim, tenho</Text>
            </View>
                
            {isChecked1 && (
                <View>
                    <View style={estilo.checkboxContainer}>
                        <CheckBox
                            value={isChecked2}
                            onValueChange={setChecked2}
                            style={estilo.checkbox}
                        />
                        <Text style={estilo.checkboxText}>1</Text>
                    </View>
                    <View style={estilo.checkboxContainer}>
                        <CheckBox
                            value={isChecked3}
                            onValueChange={setChecked3}
                            style={estilo.checkbox}
                        />
                        <Text style={estilo.checkboxText}>2</Text>
                    </View>
                    <View style={estilo.checkboxContainer}>
                        <CheckBox
                            value={isChecked4}
                            onValueChange={setChecked4}
                            style={estilo.checkbox}
                        />
                        <Text style={estilo.checkboxText}>3</Text>
                    </View>
                </View>
            )}
            
            <View style={estilo.checkboxContainer}>
                <CheckBox
                value={isChecked5}
                onValueChange={(newValue) =>{
                    setChecked5(newValue)
                    if(!newValue){
                        setChecked6(false)
                    }
                }}
                style={estilo.checkbox}
                />
                <Text style={estilo.checkboxText}>Não, não tenho.</Text>
            </View>
        
            <View style={estilo.checkboxContainer}>
                <CheckBox
                value={isChecked9}
                onValueChange={(newValue) =>{
                    setChecked9(newValue)
                    if(!newValue){
                        setChecked10(false)
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
      marginVertical: 32,
      alignItems: 'center',
      marginHorizontal: 16,
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