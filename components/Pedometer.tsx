import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PedometerComponentProps {
  onStepsChange: (steps: number) => void;
}

export default function PedometerComponent({ onStepsChange }: PedometerComponentProps) {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkPedometerStatus();
  }, []);

  useEffect(() => {
    let subscription: any = null;

    const subscribe = async () => {
      if (!isActive) return;

      try {
        console.log('🔍 Iniciando pedômetro...');
        
        const isAvailable = await Pedometer.isAvailableAsync();
        console.log('Pedômetro disponível?', isAvailable);
        
        setIsPedometerAvailable(String(isAvailable));

        if (isAvailable) {
          // Pedir permissão
          if (Platform.OS === 'android') {
            try {
              const { status } = await Pedometer.requestPermissionsAsync();
              console.log('Permissão status:', status);
              
              if (status !== 'granted') {
                Alert.alert(
                  'Permissão Negada',
                  'O app precisa de permissão para contar seus passos. Por favor, ative nas configurações do app.',
                  [
                    { text: 'OK', onPress: () => setIsActive(false) }
                  ]
                );
                await AsyncStorage.setItem('pedometroAtivo', 'false');
                return;
              }
            } catch (permError) {
              console.error('Erro ao pedir permissão:', permError);
              setError('Erro de permissão');
              setIsActive(false);
              return;
            }
          }

          // Pegar passos de hoje
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);

          console.log('Buscando passos de hoje...');

          try {
            const pastStepCount = await Pedometer.getStepCountAsync(start, end);
            console.log('Passos do dia:', pastStepCount);
            
            if (pastStepCount) {
              setCurrentStepCount(pastStepCount.steps);
              onStepsChange(pastStepCount.steps);
            }
          } catch (stepError) {
            console.error('Erro ao buscar passos:', stepError);
            setError('Erro ao buscar passos');
          }

          // Monitorar em tempo real
          console.log('Iniciando monitoramento...');
          subscription = Pedometer.watchStepCount((result) => {
            console.log('Novos passos:', result.steps);
            setCurrentStepCount(prev => {
              const newTotal = prev + result.steps;
              onStepsChange(newTotal);
              return newTotal;
            });
          });
        } else {
          console.log('❌ Pedômetro não disponível');
          setError('Dispositivo não suporta');
          Alert.alert(
            'Pedômetro indisponível',
            'Seu dispositivo não suporta contador de passos automático.',
            [
              { text: 'OK', onPress: () => setIsActive(false) }
            ]
          );
          await AsyncStorage.setItem('pedometroAtivo', 'false');
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        setIsPedometerAvailable('false');
        setError('Erro ao inicializar');
        setIsActive(false);
      }
    };

    subscribe();

    return () => {
      if (subscription) {
        console.log('🔴 Parando pedômetro');
        subscription.remove();
      }
    };
  }, [isActive]);

  const checkPedometerStatus = async () => {
    try {
      const saved = await AsyncStorage.getItem('pedometroAtivo');
      if (saved === 'true') {
        setIsActive(true);
      } else {
        setIsPedometerAvailable('false');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const handleActivate = () => {
    setShowTermsModal(true);
  };

  const handleAcceptTerms = async () => {
    try {
      await AsyncStorage.setItem('pedometroAtivo', 'true');
      setIsActive(true);
      setShowTermsModal(false);
    } catch (error) {
      console.error('Erro ao salvar preferência:', error);
      Alert.alert('Erro', 'Não foi possível ativar o pedômetro');
    }
  };

  const handleDeclineTerms = () => {
    setShowTermsModal(false);
  };

  const handleDeactivate = async () => {
    Alert.alert(
      'Desativar Pedômetro',
      'Deseja desativar o contador automático de passos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('pedometroAtivo', 'false');
              setIsActive(false);
              setCurrentStepCount(0);
              setIsPedometerAvailable('false');
            } catch (error) {
              console.error('Erro ao desativar:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.icon}>🚶</Text>
          <View style={styles.info}>
            <Text style={styles.label}>Pedômetro Automático</Text>
            <Text style={styles.status}>
              {isPedometerAvailable === 'checking' 
                ? '🔄 Verificando...' 
                : isActive && isPedometerAvailable === 'true'
                  ? '✅ Ativo' 
                  : '🔒 Desativado'}
            </Text>
          </View>
        </View>

        {isActive && isPedometerAvailable === 'true' ? (
          <>
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsNumber}>{currentStepCount.toLocaleString('pt-BR')}</Text>
              <Text style={styles.stepsLabel}>passos hoje</Text>
            </View>
            <TouchableOpacity style={styles.deactivateButton} onPress={handleDeactivate}>
              <Text style={styles.deactivateButtonText}>🔒 Desativar Pedômetro</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.inactiveContainer}>
            <Text style={styles.infoText}>
              📱 O pedômetro automático conta seus passos em tempo real usando o sensor do celular.
            </Text>
            <TouchableOpacity style={styles.activateButton} onPress={handleActivate}>
              <Text style={styles.activateButtonText}>✓ Ativar Pedômetro</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal de Termos */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>🚶</Text>
            </View>
            
            <Text style={styles.modalTitle}>Ativar Pedômetro Automático</Text>
            
            <ScrollView style={styles.termsScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.termsText}>
                O pedômetro automático utiliza o sensor de movimento do seu celular para contar seus passos durante o dia.
              </Text>
              <Text style={styles.termsText}>
                <Text style={styles.termsBold}>Como funciona:</Text>
              </Text>
              <Text style={styles.termsText}>
                • Conta seus passos automaticamente enquanto você anda{'\n'}
                • Funciona em segundo plano{'\n'}
                • Calcula as calorias gastas baseado nos seus passos{'\n'}
                • Respeita sua privacidade - os dados ficam apenas no seu celular
              </Text>
              <Text style={styles.termsText}>
                <Text style={styles.termsBold}>Importante:</Text>
              </Text>
              <Text style={styles.termsText}>
                • Requer permissão de acesso aos sensores de movimento{'\n'}
                • Pode consumir um pouco mais de bateria{'\n'}
                • Funciona apenas em dispositivos físicos (não em emuladores){'\n'}
                • Você pode desativar a qualquer momento
              </Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={handleAcceptTerms}
              >
                <Text style={styles.acceptButtonText}>✓ Ativar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={handleDeclineTerms}
              >
                <Text style={styles.declineButtonText}>✕ Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  stepsContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginBottom: 10,
  },
  stepsNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  stepsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  inactiveContainer: {
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  activateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deactivateButton: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  deactivateButtonText: {
    color: '#FF5252',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  termsScroll: {
    maxHeight: 300,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  termsBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  modalButtons: {
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});