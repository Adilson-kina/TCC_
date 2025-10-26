import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';

export default function jejum() {
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false); // Change to false in production
  const [jejumStarted, setJejumStarted] = useState(false);
  const [jejumTime, setJejumTime] = useState({ hours: 9, minutes: 0 });

  const goBack = () => {
    console.log("Going back to home");
    // router.back();
  };

  const handleStartJejum = () => {
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }
    setJejumStarted(true);
    console.log("Jejum started!");
  };

  const handleStopJejum = () => {
    setJejumStarted(false);
    console.log("Jejum stopped!");
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
    setJejumStarted(true);
  };

  const handleDeclineTerms = () => {
    setShowTerms(false);
  };

  const adjustTime = (type, increment) => {
    setJejumTime(prev => {
      let newHours = prev.hours;
      let newMinutes = prev.minutes;

      if (type === 'hours') {
        newHours = Math.max(0, Math.min(23, prev.hours + increment));
      } else {
        newMinutes = Math.max(0, Math.min(59, prev.minutes + increment));
      }

      return { hours: newHours, minutes: newMinutes };
    });
  };

  const formatTime = (value) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <View style={styles.backButtonCircle}>
            <Text style={styles.backButtonText}>←</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Meta de Perder Peso</Text>
        
        <Text style={styles.subtitle}>Ajuste de Jejum:</Text>

        {/* Time Picker */}
        <View style={styles.timePickerContainer}>
          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => adjustTime('hours', 1)}>
              <Text style={styles.arrowButton}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeDisplay}>{formatTime(jejumTime.hours)}</Text>
            <TouchableOpacity onPress={() => adjustTime('hours', -1)}>
              <Text style={styles.arrowButton}>▼</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.timeSeparator}>:</Text>

          <View style={styles.timeColumn}>
            <TouchableOpacity onPress={() => adjustTime('minutes', 1)}>
              <Text style={styles.arrowButton}>▲</Text>
            </TouchableOpacity>
            <Text style={styles.timeDisplay}>{formatTime(jejumTime.minutes)}</Text>
            <TouchableOpacity onPress={() => adjustTime('minutes', -1)}>
              <Text style={styles.arrowButton}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.description}>
          Fazer refeições a cada {jejumTime.hours} horas
        </Text>

        {/* Clock Icon (shown when jejum is active) */}
        {jejumStarted && (
          <View style={styles.clockContainer}>
            <View style={styles.clockCircle}>
              <View style={styles.clockHand} />
            </View>
          </View>
        )}

        {/* Action Button */}
        {!jejumStarted ? (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartJejum}
          >
            <Text style={styles.startButtonText}>Começar Agora</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.stopButton}
            onPress={handleStopJejum}
          >
            <Text style={styles.stopButtonText}>Parar Jejum</Text>
          </TouchableOpacity>
        )}

        {/* Countdown Timer */}
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>Para sua próxima refeição faltam</Text>
          <Text style={styles.countdownTime}>9:00:00</Text>
        </View>
      </View>

      {/* Terms Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTerms}
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Termo de Ciência</Text>
            
            <ScrollView style={styles.termsScroll}>
              <Text style={styles.termsText}>
                A funcionalidade de jejum vem desativada por padrão, pois, se mal utilizada, pode gerar resultados indesejáveis. Por exemplo, o efeito sanfona.
              </Text>
              <Text style={styles.termsText}>
                Antes de ativá-la, certifique-se de que o jejum foi recomendado por seu nutricionista e de que você está ciente de que a responsabilidade pelo uso da funcionalidade é inteiramente sua.
              </Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={handleAcceptTerms}
              >
                <Text style={styles.acceptButtonText}>Prosseguir</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={handleDeclineTerms}
              >
                <Text style={styles.declineButtonText}>Voltar ao início</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeColumn: {
    alignItems: 'center',
  },
  arrowButton: {
    fontSize: 30,
    color: '#4CAF50',
    padding: 10,
  },
  timeDisplay: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  timeSeparator: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  clockContainer: {
    marginVertical: 30,
  },
  clockCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  clockHand: {
    width: 6,
    height: 40,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    top: 20,
    borderRadius: 3,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 30,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stopButton: {
    backgroundColor: '#F44336',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginBottom: 30,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  countdownTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  termsScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
    textAlign: 'justify',
  },
  modalButtons: {
    gap: 15,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  declineButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
