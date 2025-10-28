import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const API_BASE = 'https://dietase.xo.je/TCC/PHP';

interface Alimento {
  id: number;
  nome: string;
  energia_kcal: string;
  carboidrato_g: string;
  proteina_g: string;
  lipideos_g: string;
  categoria: string;
}

export default function RefeicoesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  
  const [alimentosPermitidos, setAlimentosPermitidos] = useState<Alimento[]>([]);
  
  const [modalVisivel, setModalVisivel] = useState(false);
  const [tipoRefeicaoSelecionado, setTipoRefeicaoSelecionado] = useState('');
  const [alimentosSelecionados, setAlimentosSelecionados] = useState<number[]>([]);
  const [sintomaSelecionado, setSintomaSelecionado] = useState('nenhum');
  const [termoBusca, setTermoBusca] = useState('');

  const tiposRefeicao = [
    { id: 'cafe', nome: 'Café da Manhã', emoji: '⛅', cor: '#FFE082' },
    { id: 'almoco', nome: 'Almoço', emoji: '🍽️', cor: '#81C784' },
    { id: 'lanche', nome: 'Lanche', emoji: '☕', cor: '#FFCC80' },
    { id: 'janta', nome: 'Jantar', emoji: '🌙', cor: '#9575CD' },
  ];

  const sintomas = [
    { id: 'nenhum', nome: 'Nenhum sintoma', emoji: '✅' },
    { id: 'azia', nome: 'Azia', emoji: '🔥' },
    { id: 'enjoo', nome: 'Enjoo', emoji: '🤢' },
    { id: 'diarreia', nome: 'Diarreia', emoji: '💧' },
    { id: 'dor_estomago', nome: 'Dor de estômago', emoji: '😣' },
  ];

  useEffect(() => {
    carregarAlimentosPermitidos();
  }, []);

  const carregarAlimentosPermitidos = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_BASE}/refeicoes.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.alimentos) {
        setAlimentosPermitidos(data.alimentos);
      }
    } catch (error) {
      console.error('Erro ao carregar alimentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alimentos permitidos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (tipoRefeicao: string) => {
    setTipoRefeicaoSelecionado(tipoRefeicao);
    setAlimentosSelecionados([]);
    setSintomaSelecionado('nenhum');
    setTermoBusca('');
    setModalVisivel(true);
  };

  const toggleAlimento = (alimentoId: number) => {
    setAlimentosSelecionados(prev => {
      if (prev.includes(alimentoId)) {
        return prev.filter(id => id !== alimentoId);
      } else {
        return [...prev, alimentoId];
      }
    });
  };

  const registrarRefeicao = async () => {
    if (alimentosSelecionados.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos um alimento');
      return;
    }

    try {
      setSalvando(true);
      const token = await AsyncStorage.getItem('token');
      
      const alimentosFormatados = alimentosSelecionados.map(id => ({ id }));
      
      const response = await fetch(`${API_BASE}/refeicoes.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tipo_refeicao: tipoRefeicaoSelecionado,
          sintoma: sintomaSelecionado,
          alimentos: alimentosFormatados
        })
      });

      const data = await response.json();

      if (data.mensagem) {
        Alert.alert('Sucesso', 'Refeição registrada com sucesso!');
        setModalVisivel(false);
        setAlimentosSelecionados([]);
        setTermoBusca('');
      } else if (data.erro) {
        Alert.alert('Erro', data.erro);
      }
    } catch (error) {
      console.error('Erro ao registrar refeição:', error);
      Alert.alert('Erro', 'Não foi possível registrar a refeição');
    } finally {
      setSalvando(false);
    }
  };

  const alimentosFiltrados = alimentosPermitidos.filter(alimento =>
    alimento.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 Registrar Refeição</Text>
          <Text style={styles.headerSubtitle}>
            Selecione o tipo de refeição para registrar
          </Text>
        </View>

        {tiposRefeicao.map((tipo) => (
          <TouchableOpacity
            key={tipo.id}
            style={[styles.refeicaoCard, { borderColor: tipo.cor }]}
            onPress={() => abrirModal(tipo.id)}
          >
            <View style={[styles.refeicaoIconContainer, { backgroundColor: tipo.cor }]}>
              <Text style={styles.refeicaoEmoji}>{tipo.emoji}</Text>
            </View>
            <View style={styles.refeicaoInfo}>
              <Text style={styles.refeicaoNome}>{tipo.nome}</Text>
              <Text style={styles.refeicaoSubtitle}>Toque para registrar</Text>
            </View>
            <Text style={styles.refeicaoArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Registrar {tiposRefeicao.find(t => t.id === tipoRefeicaoSelecionado)?.nome}
              </Text>
              <TouchableOpacity onPress={() => setModalVisivel(false)}>
                <Text style={styles.modalFechar}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Buscar alimento..."
              value={termoBusca}
              onChangeText={setTermoBusca}
            />

            <Text style={styles.sectionLabel}>
              Alimentos ({alimentosSelecionados.length} selecionados)
            </Text>
            <ScrollView style={styles.alimentosLista} showsVerticalScrollIndicator={true}>
              {alimentosFiltrados.length > 0 ? (
                alimentosFiltrados.map((alimento) => {
                  const selecionado = alimentosSelecionados.includes(alimento.id);
                  return (
                    <TouchableOpacity
                      key={alimento.id}
                      style={[
                        styles.alimentoItem,
                        selecionado && styles.alimentoItemSelecionado
                      ]}
                      onPress={() => toggleAlimento(alimento.id)}
                    >
                      <View style={styles.alimentoInfo}>
                        <Text style={styles.alimentoNome}>{alimento.nome}</Text>
                        <Text style={styles.alimentoKcal}>
                          {parseFloat(alimento.energia_kcal).toFixed(0)} Kcal/100g
                        </Text>
                      </View>
                      <View style={[
                        styles.checkbox,
                        selecionado && styles.checkboxSelected
                      ]}>
                        {selecionado && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {termoBusca 
                      ? 'Nenhum alimento encontrado'
                      : 'Digite para buscar alimentos'}
                  </Text>
                </View>
              )}
            </ScrollView>

            <Text style={styles.sectionLabel}>Sintoma após a refeição:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sintomasContainer}>
              {sintomas.map((sintoma) => (
                <TouchableOpacity
                  key={sintoma.id}
                  style={[
                    styles.sintomaChip,
                    sintomaSelecionado === sintoma.id && styles.sintomaChipSelected
                  ]}
                  onPress={() => setSintomaSelecionado(sintoma.id)}
                >
                  <Text style={styles.sintomaEmoji}>{sintoma.emoji}</Text>
                  <Text style={[
                    styles.sintomaNome,
                    sintomaSelecionado === sintoma.id && styles.sintomaTextSelected
                  ]}>
                    {sintoma.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.confirmarBtn,
                alimentosSelecionados.length === 0 && styles.confirmarBtnDisabled
              ]}
              onPress={registrarRefeicao}
              disabled={salvando || alimentosSelecionados.length === 0}
            >
              {salvando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.confirmarBtnText}>
                  Registrar Refeição
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecfcec',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  refeicaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refeicaoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  refeicaoEmoji: {
    fontSize: 24,
  },
  refeicaoInfo: {
    flex: 1,
  },
  refeicaoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  refeicaoSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  refeicaoArrow: {
    fontSize: 30,
    color: '#CCC',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalFechar: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  alimentosLista: {
    maxHeight: 250,
    marginBottom: 15,
  },
  alimentoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  alimentoItemSelecionado: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  alimentoInfo: {
    flex: 1,
  },
  alimentoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alimentoKcal: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sintomasContainer: {
    marginBottom: 15,
  },
  sintomaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sintomaChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sintomaEmoji: {
    fontSize: 16,
    marginRight: 5,
  },
  sintomaNome: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sintomaTextSelected: {
    color: '#FFF',
  },
  confirmarBtn: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmarBtnDisabled: {
    backgroundColor: '#CCC',
  },
  confirmarBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 30,
  },
});