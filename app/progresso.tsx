import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const API_BASE = 'https://tcc-production-b4f7.up.railway.app/PHP';
const screenWidth = Dimensions.get('window').width;

export default function ProgressoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [novoPeso, setNovoPeso] = useState('');
  const [podeAtualizar, setPodeAtualizar] = useState(true);
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [mostrarModalMeta, setMostrarModalMeta] = useState(false);
  const [novaMeta, setNovaMeta] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [alterandoMeta, setAlterandoMeta] = useState(false);
  
  const [dadosProgresso, setDadosProgresso] = useState({
    meta: '',
    peso_inicial: 0,
    imc_inicial: 0,
    peso_atual: 0,
    imc_atual: 0,
    altura: 0,
    historico: [],
    valor_desejado: 0,
    bateu_meta: false,
    total_registros_peso: 0,
    ultima_atualizacao: null
  });

  useEffect(() => {
    carregarProgresso();
  }, []);

  const carregarProgresso = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_BASE}/progresso.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.mensagem) {
        setDadosProgresso(data);
        
        // Verificar se pode atualizar
        if (data.ultima_atualizacao) {
          const ultimaData = new Date(data.ultima_atualizacao);
          const hoje = new Date();
          const diferencaDias = Math.floor((hoje - ultimaData) / (1000 * 60 * 60 * 24));
          
          if (diferencaDias < 7) {
            setPodeAtualizar(false);
            setDiasRestantes(7 - diferencaDias);
          } else {
            setPodeAtualizar(true);
            setDiasRestantes(0);
          }
        } else {
          setPodeAtualizar(true);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    } finally {
      setLoading(false);
    }
  };

  const alterarMeta = async () => {
    if (!novaMeta) {
      Alert.alert('Erro', 'Selecione um tipo de meta');
      return;
    }

    if (novaMeta !== 'massa' && (!novoValor || isNaN(parseFloat(novoValor)))) {
      Alert.alert('Erro', 'Insira um valor válido para sua meta');
      return;
    }

    try {
      setAlterandoMeta(true);
      const token = await AsyncStorage.getItem('token');

      const body = {
        tipo_meta: novaMeta,
        valor_desejado: novaMeta === 'massa' ? null : parseFloat(novoValor)
      };

      const response = await fetch(`${API_BASE}/progresso.php`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.mensagem) {
        Alert.alert('Sucesso', 'Meta alterada com sucesso!');
        setMostrarModalMeta(false);
        setNovaMeta('');
        setNovoValor('');
        carregarProgresso();
      } else if (data.erro) {
        Alert.alert('Erro', data.erro);
      }
    } catch (error) {
      console.error('Erro ao alterar meta:', error);
      Alert.alert('Erro', 'Não foi possível alterar a meta');
    } finally {
      setAlterandoMeta(false);
    }
  };

  const confirmarAlteracaoMeta = () => {
    if (dadosProgresso.bateu_meta) {
      setMostrarModalMeta(true);
    } else {
      Alert.alert(
        'Alterar Meta',
        'Você ainda não bateu sua meta atual. Tem certeza que deseja alterar? Seu progresso será reiniciado.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim, alterar', onPress: () => setMostrarModalMeta(true) }
        ]
      );
    }
  };

  const formatarMetaBotao = (meta: string) => {
    const metas = {
      'perder': 'Perder Peso',
      'ganhar': 'Ganhar Peso',
      'manter': 'Manter Peso',
      'massa': 'Ganhar Massa'
    };
    return metas[meta] || meta;
  };

  const atualizarPeso = async () => {
    if (!podeAtualizar) {
      Alert.alert(
        'Aguarde!', 
        `Você só pode atualizar seu peso uma vez por semana. Faltam ${diasRestantes} dia(s).`
      );
      return;
    }

    if (!novoPeso || isNaN(parseFloat(novoPeso))) {
      Alert.alert('Erro', 'Insira um peso válido');
      return;
    }

    try {
      setSalvando(true);
      const token = await AsyncStorage.getItem('token');
      
      const bodyData = { peso: parseFloat(novoPeso) };
      
      // 🔍 DEBUG
      console.log('=== ENVIANDO PESO ===');
      console.log('Token:', token);
      console.log('Body:', bodyData);
      console.log('Peso parseado:', parseFloat(novoPeso));

      const response = await fetch(`${API_BASE}/progresso.php`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();
      
      // 🔍 DEBUG
      console.log('=== RESPOSTA ===');
      console.log('Status:', response.status);
      console.log('Data:', data);

      if (data.mensagem) {
        Alert.alert('Sucesso', 'Peso atualizado com sucesso!');
        setNovoPeso('');
        carregarProgresso();
      } else if (data.erro) {
        Alert.alert('Erro', data.erro);
      }
    } catch (error) {
      console.error('Erro ao atualizar peso:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o peso');
    } finally {
      setSalvando(false);
    }
  };

  const formatarMeta = (meta: string) => {
    const metas = {
      'perder': 'Meta de Perder Peso',
      'ganhar': 'Meta de Ganhar Peso',
      'manter': 'Meta de Manter Peso',
      'massa': 'Meta de Ganhar Massa'
    };
    return metas[meta] || 'Meta não definida';
  };

  const calcularDiferenca = () => {
    const diferenca = dadosProgresso.peso_atual - dadosProgresso.peso_inicial;
    return diferenca;
  };

  const formatarDiferenca = () => {
    const diferenca = calcularDiferenca();
    const sinal = diferenca > 0 ? '+' : '';
    return `${sinal}${diferenca.toFixed(1)}Kg`;
  };

  const getStatusIMC = (imc: number) => {
    if (imc < 18.5) return { texto: 'Abaixo do peso', cor: '#FF9800' };
    if (imc < 25) return { texto: 'Peso ideal', cor: '#4CAF50' };
    if (imc < 30) return { texto: 'Sobrepeso', cor: '#FF9800' };
    return { texto: 'Obesidade', cor: '#F44336' };
  };

  const calcularSemanas = () => {
    const diferenca = Math.abs(calcularDiferenca());
    const semanas = Math.round(diferenca / 0.5);
    return semanas;
  };

  const renderGrafico = () => {
    const historico = dadosProgresso.historico || [];
    
    if (historico.length === 0) return null;
    
    const pesos = historico.map(h => parseFloat(h.peso));
    const maxPeso = Math.max(...pesos) + 2;
    const minPeso = Math.min(...pesos) - 2;
    const range = maxPeso - minPeso;

    const graphHeight = 200;
    const graphWidth = screenWidth - 80;
    const pointSpacing = graphWidth / (historico.length - 1);

    return (
      <View style={styles.graphContainer}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.gridLine, { top: (graphHeight / 4) * i }]} />
        ))}

        <View style={styles.lineContainer}>
          {historico.map((item, index) => {
            if (index === 0) return null;
            
            const prevPeso = parseFloat(historico[index - 1].peso);
            const currPeso = parseFloat(item.peso);
            
            const prevY = graphHeight - ((prevPeso - minPeso) / range) * graphHeight;
            const currY = graphHeight - ((currPeso - minPeso) / range) * graphHeight;
            
            const prevX = (index - 1) * pointSpacing;
            const currX = index * pointSpacing;
            
            const angle = Math.atan2(currY - prevY, currX - prevX) * (180 / Math.PI);
            const length = Math.sqrt(Math.pow(currX - prevX, 2) + Math.pow(currY - prevY, 2));
            
            return (
              <View
                key={index}
                style={[
                  styles.line,
                  { width: length, left: prevX, top: prevY, transform: [{ rotate: `${angle}deg` }] }
                ]}
              />
            );
          })}
        </View>

        {historico.map((item, index) => {
          const peso = parseFloat(item.peso);
          const y = graphHeight - ((peso - minPeso) / range) * graphHeight;
          const x = index * pointSpacing;
          
          return (
            <View key={index} style={[styles.graphPoint, { left: x - 6, top: y - 6 }]} />
          );
        })}

        <View style={styles.xAxisLabels}>
          {historico.map((item, index) => {
            if (index % Math.ceil(historico.length / 3) !== 0 && index !== historico.length - 1) return null;
            const x = index * pointSpacing;
            return (
              <Text key={index} style={[styles.axisLabel, { position: 'absolute', left: x - 20 }]}>
                {item.data_formatada}
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando progresso...</Text>
      </View>
    );
  }

  const temDadosPeso = dadosProgresso.peso_inicial > 0 && dadosProgresso.peso_atual > 0;

  if (!temDadosPeso) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>📊 Progresso</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⚖️</Text>
            <Text style={styles.emptyTitle}>Nenhum peso registrado ainda</Text>
            <Text style={styles.emptySubtitle}>
              Registre seu peso atual para começar a acompanhar seu progresso!
            </Text>

            <View style={styles.firstWeightCard}>
              <Text style={styles.inputLabel}>Registrar seu primeiro peso:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Insira seu peso em Kg"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={novoPeso}
                  onChangeText={setNovoPeso}
                />
                <TouchableOpacity
                  style={[styles.submitButton, salvando && styles.submitButtonDisabled]}
                  onPress={atualizarPeso}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>▶</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  const statusImcInicial = getStatusIMC(dadosProgresso.imc_inicial);
  const statusImcAtual = getStatusIMC(dadosProgresso.imc_atual);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Progresso</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{formatarMeta(dadosProgresso.meta)}</Text>

            {renderGrafico()}

            <View style={styles.statsContainer}>
              <View style={styles.statColumn}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.statLabel}>INICIAL:</Text>
                <Text style={styles.statWeight}>{dadosProgresso.peso_inicial}Kg</Text>
                <Text style={[styles.statIMC, { color: statusImcInicial.cor }]}>
                  IMC: {statusImcInicial.texto}
                </Text>
              </View>

              <View style={styles.statColumn}>
                <Text style={styles.statEmoji}>⏳</Text>
                <Text style={styles.statLabel}>ATUAL:</Text>
                <Text style={styles.statWeight}>{dadosProgresso.peso_atual}Kg</Text>
                <Text style={[styles.statIMC, { color: statusImcAtual.cor }]}>
                  IMC: {statusImcAtual.texto}
                </Text>
              </View>
            </View>

          <View style={styles.progressInfo}>
            {dadosProgresso.total_registros_peso === 1 ? (
              <>
                <Text style={styles.progressText}>🎉 Parabéns!</Text>
                <Text style={styles.progressText}>Você registrou seu peso pela primeira vez!</Text>
                <Text style={styles.progressText}>Continue acompanhando sua evolução! 💪</Text>
              </>
            ) : dadosProgresso.meta === 'massa' ? (
              <>
                <Text style={styles.progressText}>Você já registrou seu peso</Text>
                <Text style={styles.weeksText}>{dadosProgresso.total_registros_peso}</Text>
                <Text style={styles.progressText}>vezes! Continue assim! 💪</Text>
              </>
            ) : (() => {
              const diferenca = calcularDiferenca();
              const semanas = calcularSemanas();
              const atingiuValor = dadosProgresso.bateu_meta;
              
              // Verifica se está SEGUINDO a meta (perdendo/ganhando na direção certa)
              const seguindoMeta = 
                (dadosProgresso.meta === 'perder' && diferenca < -0.3) || // Perdeu pelo menos 300g
                (dadosProgresso.meta === 'ganhar' && diferenca > 0.3) ||  // Ganhou pelo menos 300g
                (dadosProgresso.meta === 'manter' && Math.abs(diferenca) <= 1); // Manteve ±1kg
              
              if (atingiuValor) {
                return (
                  <>
                    <Text style={styles.progressText}>
                      🎉 Parabéns! Você atingiu sua meta de {dadosProgresso.valor_desejado}kg em
                    </Text>
                    <Text style={styles.weeksText}>{semanas}</Text>
                    <Text style={styles.progressText}>Semanas! 🎯</Text>
                  </>
                );
              }
              
              if (seguindoMeta) {
                return (
                  <>
                    <Text style={styles.progressText}>
                      💪 Você {
                        dadosProgresso.meta === 'perder' ? 'perdeu' :
                        dadosProgresso.meta === 'ganhar' ? 'ganhou' : 'manteve'
                      }
                    </Text>
                    <Text style={styles.weeksText}>{Math.abs(diferenca).toFixed(1)}kg</Text>
                    <Text style={styles.progressText}>
                      em {semanas} {semanas === 1 ? 'semana' : 'semanas'}! 
                      {dadosProgresso.meta === 'perder' && ` Faltam ${(dadosProgresso.peso_atual - dadosProgresso.valor_desejado).toFixed(1)}kg!` }
                      {dadosProgresso.meta === 'ganhar' && ` Faltam ${(dadosProgresso.valor_desejado - dadosProgresso.peso_atual).toFixed(1)}kg!` }
                      {dadosProgresso.meta === 'manter' && ' Continue assim! 🎯' }
                    </Text>
                  </>
                );
              }
              
              // Não está seguindo a meta
              return (
                <>
                  <Text style={styles.progressText}>
                    ⚠️ Você {diferenca > 0 ? 'ganhou' : 'perdeu'}
                  </Text>
                  <Text style={styles.weeksText}>{Math.abs(diferenca).toFixed(1)}kg</Text>
                  <Text style={styles.progressText}>
                    {dadosProgresso.meta === 'perder' && diferenca > 0 ? 
                      'Você está ganhando peso. Revise sua dieta!' :
                    dadosProgresso.meta === 'ganhar' && diferenca < 0 ?
                      'Você está perdendo peso. Aumente as calorias!' :
                    dadosProgresso.meta === 'manter' ?
                      'Muita variação! Tente manter mais estável.' :
                      'Ajuste sua estratégia!'
                    }
                  </Text>
                </>
              );
            })()}
          </View>

            {/* ⚠️ AVISO SE NÃO PODE ATUALIZAR */}
            {!podeAtualizar && (
              <View style={styles.warningBox}>
                <Text style={styles.warningIcon}>⏰</Text>
                <Text style={styles.warningText}>
                  Você só pode atualizar seu peso uma vez por semana.
                </Text>
                <Text style={styles.warningDays}>
                  Faltam {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''} para a próxima atualização
                </Text>
              </View>
            )}

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Registrar novo peso:</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, !podeAtualizar && styles.inputDisabled]}
                  placeholder={podeAtualizar ? "Insira seu peso em Kg" : "Aguarde para atualizar"}
                  keyboardType="numeric"
                  value={novoPeso}
                  onChangeText={setNovoPeso}
                  editable={podeAtualizar}
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton, 
                    (salvando || !podeAtualizar) && styles.submitButtonDisabled
                  ]}
                  onPress={atualizarPeso}
                  disabled={salvando || !podeAtualizar}
                >
                  {salvando ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>▶</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Botão de Alterar Meta */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.alterarMetaButton}
              onPress={confirmarAlteracaoMeta}
            >
              <Text style={styles.alterarMetaIcon}>🎯</Text>
              <Text style={styles.alterarMetaText}>Alterar Meta</Text>
            </TouchableOpacity>
            
            {dadosProgresso.bateu_meta && (
              <Text style={styles.alterarMetaHint}>
                ✅ Parabéns! Você pode definir uma nova meta agora!
              </Text>
            )}
          </View>

          {/* Modal de Alterar Meta */}
          {mostrarModalMeta && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>🎯 Nova Meta</Text>
                
                <Text style={styles.modalLabel}>Escolha sua meta:</Text>
                <View style={styles.metaOptions}>
                  <TouchableOpacity
                    style={[styles.metaOption, novaMeta === 'perder' && styles.metaOptionSelected]}
                    onPress={() => setNovaMeta('perder')}
                  >
                    <Text style={styles.metaOptionText}>🔥 Perder</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.metaOption, novaMeta === 'ganhar' && styles.metaOptionSelected]}
                    onPress={() => setNovaMeta('ganhar')}
                  >
                    <Text style={styles.metaOptionText}>📈 Ganhar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.metaOption, novaMeta === 'manter' && styles.metaOptionSelected]}
                    onPress={() => setNovaMeta('manter')}
                  >
                    <Text style={styles.metaOptionText}>⚖️ Manter</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.metaOption, novaMeta === 'massa' && styles.metaOptionSelected]}
                    onPress={() => setNovaMeta('massa')}
                  >
                    <Text style={styles.metaOptionText}>💪 Massa</Text>
                  </TouchableOpacity>
                </View>
                
                {novaMeta && novaMeta !== 'massa' && (
                  <>
                    <Text style={styles.modalLabel}>Peso desejado (kg):</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Ex: 65.5"
                      keyboardType="numeric"
                      value={novoValor}
                      onChangeText={setNovoValor}
                    />
                  </>
                )}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => {
                      setMostrarModalMeta(false);
                      setNovaMeta('');
                      setNovoValor('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm, alterandoMeta && styles.modalButtonDisabled]}
                    onPress={alterarMeta}
                    disabled={alterandoMeta}
                  >
                    {alterandoMeta ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Confirmar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  alterarMetaButton: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  alterarMetaIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  alterarMetaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  alterarMetaHint: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  metaOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  metaOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  metaOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  metaOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonConfirm: {
    backgroundColor: '#4CAF50',
  },
  modalButtonDisabled: {
    backgroundColor: '#CCC',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  firstWeightCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 15,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 25,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingTop: 15,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  graphContainer: {
    height: 200,
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 10,
  },
  gridLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  lineContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 10,
    bottom: 30,
  },
  line: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#4CAF50',
    transformOrigin: 'left center',
  },
  graphPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 5,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisLabel: {
    fontSize: 11,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statColumn: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  statWeight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  statIMC: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressInfo: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  weeksText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 5,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 5,
  },
  warningDays: {
    fontSize: 13,
    color: '#856404',
    fontWeight: 'bold',
  },
  inputSection: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#E0E0E0',
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});