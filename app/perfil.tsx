import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


export default function Perfil(){
    const prosseguir = () => {
      if (!data || !peso || !altura) {
        alert("Campos obrigatórios"+ "Por favor, preencha todos os campos!");
        return;
      }

      if (data.length !== 10) {
        alert("Data inválida! "+ "\nPor favor, insira uma data completa no formato DD/MM/AAAA");
        return;
      }

      const pesoNumero = parseFloat(peso.replace(',', '.'));
      if (isNaN(pesoNumero) || pesoNumero <= 0 || pesoNumero > 300) {
        alert("Peso inválido! "+ "\nPor favor, insira um peso válido de até 300kg");
        return;
      }

      const alturaNumero = parseInt(altura);
      if (isNaN(alturaNumero) || alturaNumero <= 0 || alturaNumero > 280) {
        alert("Altura inválida! "+ "\nPor favor, insira uma altura válida de até 280cm");
        return;
      }

      console.log("Data:", data);
      console.log("Peso:", peso, "kg");
      console.log("Altura:", altura, "cm");
      console.log("Imagem:", imagem);
      console.log("Cor do avatar:", avatarBackgroundColor);
      const router = useRouter();
      router.navigate("/home");
      
  }

  const [imagem, setImagem] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('imagem') // 'imagem' or 'cor'

  // Array with 7 pre-selected images
  const preSelectedImages = [
    require('./img/avatar1.png'),
    require('./img/avatar2.png'),
    require('./img/avatar3.png'),
    require('./img/avatar4.png'),
    require('./img/avatar5.png'),
    require('./img/avatar6.png'),
  ]

  // Array of avatar background colors
  const avatarColors = [
    { name: 'Branco', color: '#FFFFFF' },
    { name: 'Verde Claro', color: '#A8E6CF' },
    { name: 'Azul Claro', color: '#A8D8EA' },
    { name: 'Rosa Claro', color: '#FFB6C1' },
    { name: 'Amarelo', color: '#FFE156' },
    { name: 'Roxo Claro', color: '#DDA0DD' },
    { name: 'Laranja', color: '#FFB347' },
    { name: 'Cinza', color: '#C0C0C0' },
    { name: 'Vermelho', color: '#FF6B6B' },
    { name: 'Verde', color: '#4CAF50' },
    { name: 'Azul', color: '#4A90E2' },
    { name: 'Rosa Pink', color: '#FF69B4' },
  ]

  const [backgroundColor, setBackgroundColor] = useState('#E0F7E9')
  const [avatarBackgroundColor, setAvatarBackgroundColor] = useState('#FFFFFF')

  const pickImage = () => {
    setActiveTab('imagem')
    setModalVisible(true)
  }

  const selectImage = (imageIndex) => {
    setImagem(imageIndex)
    setModalVisible(false)
  }

  const selectAvatarColor = (color) => {
    setAvatarBackgroundColor(color)
    setModalVisible(false)
  }

  const [data, setData] = useState("")
  const [peso, setPeso] = useState("")
  const [altura, setAltura] = useState("")

  const formatarData = (texto) => {
    let números = texto.replace(/\D/g, "")

    if(números.length <= 2){
      setData(números)
    }else if(números.length <= 4){
      setData(`${números.slice(0,2)}/${números.slice(2)}`)
    }else if(números.length <= 8){
      setData(`${números.slice(0, 2)}/${números.slice(2, 4)}/${números.slice(4, 8)}`)
    }else{
      setData(`${números.slice(0, 2)}/${números.slice(2, 4)}/${números.slice(4, 8)}`)
    }
  }

  const formatarKG = (texto) => {
    let pesoNumérico = texto.replace(/[^\d,.]/g, "")
    setPeso(pesoNumérico)
  }

  const formatarCM = (texto) => {
    let alturaNumérica = texto.replace(/\D/g, "")
    setAltura(alturaNumérica)
  }

  return(
    <View style={[estilo.container, { backgroundColor: backgroundColor }]}>
      <View style={estilo.bloco}>
        <TouchableOpacity style={estilo.conjuntoImg} onPress={pickImage}>
          <View style={[estilo.imgContainer, { backgroundColor: avatarBackgroundColor }]}>
            <Image
              style={estilo.img}
              source={imagem !== null ? preSelectedImages[imagem] : require('./img/proxy-image.jpg')}
            />
          </View>
        </TouchableOpacity>

        <View style={estilo.conjunto}>
          <Text style={estilo.etiqueta}>Data de Nascimento:</Text>
          <TextInput
            value={data}
            maxLength={10}
            style={estilo.input}
            onChangeText={formatarData}
            placeholder='DD/MM/AAAA'
            keyboardType='number-pad'
          />
        </View>

        <View style={estilo.conjunto}>
          <Text style={estilo.etiqueta}>Peso (kg):</Text>
          <TextInput
            value={peso}
            maxLength={6}
            style={estilo.input}
            keyboardType='numeric'
            onChangeText={formatarKG}
            placeholder='Insira seu peso em quilogramas'
          />
        </View>
        
        <View style={estilo.conjunto}>
          <Text style={estilo.etiqueta}>Altura (cm):</Text>
          <TextInput
            value={altura}
            maxLength={3}
            style={estilo.input}
            keyboardType='numeric'
            onChangeText={formatarCM}
            placeholder='Insira sua altura em centímetros'
          />
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

      {/* Modal for image and color selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={estilo.modalOverlay}>
          <View style={estilo.modalContent}>
            <Text style={estilo.modalTitle}>Personalizar Avatar</Text>
            
            {/* Tab buttons */}
            <View style={estilo.tabContainer}>
              <TouchableOpacity
                style={[
                  estilo.tabButton,
                  activeTab === 'imagem' && estilo.tabButtonActive
                ]}
                onPress={() => setActiveTab('imagem')}
              >
                <Text style={[
                  estilo.tabButtonText,
                  activeTab === 'imagem' && estilo.tabButtonTextActive
                ]}>
                  Imagens
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  estilo.tabButton,
                  activeTab === 'cor' && estilo.tabButtonActive
                ]}
                onPress={() => setActiveTab('cor')}
              >
                <Text style={[
                  estilo.tabButtonText,
                  activeTab === 'cor' && estilo.tabButtonTextActive
                ]}>
                  Cor de Fundo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content based on active tab */}
            <ScrollView contentContainerStyle={estilo.scrollContent}>
              {activeTab === 'imagem' ? (
                <View style={estilo.imageGrid}>
                  {preSelectedImages.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectImage(index)}
                      style={estilo.imageOption}
                    >
                      <View style={[estilo.thumbnailContainer, { backgroundColor: avatarBackgroundColor }]}>
                        <Image
                          source={img}
                          style={estilo.thumbnailImg}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={estilo.colorGrid}>
                  {avatarColors.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectAvatarColor(item.color)}
                      style={estilo.colorOption}
                    >
                      <View
                        style={[
                          estilo.colorCircle,
                          { backgroundColor: item.color },
                          avatarBackgroundColor === item.color && estilo.colorCircleSelected
                        ]}
                      />
                      <Text style={estilo.colorName}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={estilo.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={estilo.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilo = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F7E9',
  },

  bloco:{
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  conjunto: {
    marginBottom: 10,
  },

  conjuntoImg:{
    marginBottom: 50,
  },

  imgContainer: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderRadius: 100,
    borderColor: 'black',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageContainer: {
    marginBottom: 20,
  },

  input: {
    width: 250,
    padding: 5,
    borderWidth: 2,
    borderRadius: 20,
    textAlign: 'center',
    borderColor: "black",
    backgroundColor: "white",
  },

  etiqueta: {
    fontSize: 15,
    fontWeight: "bold",
  },

  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },

  tabButtonActive: {
    backgroundColor: '#4CAF50',
  },

  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  tabButtonTextActive: {
    color: 'white',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
  },

  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },

  imageOption: {
    margin: 5,
  },

  thumbnailContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'black',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  thumbnailImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },

  colorOption: {
    alignItems: 'center',
    margin: 5,
    width: 90,
  },

  colorCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#333',
    marginBottom: 5,
  },

  colorCircleSelected: {
    borderWidth: 5,
    borderColor: '#4CAF50',
  },

  colorName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },

  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
  },

  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
