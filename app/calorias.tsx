import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Calorias() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const navigateTo = (screen) => {
    console.log(`Navigating to: ${screen}`);
    //const router = useRouter();
    //router.navigate("/place");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌾</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigateTo('perfil')}
        >
          <View style={styles.profilePhoto} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Minha Dieta Card */}
        <TouchableOpacity 
          style={styles.dietCard}
          onPress={() => navigateTo('minha-dieta')}
        >
          <View style={styles.dietHeader}>
            <Text style={styles.dietIcon}>🍽️</Text>
            <Text style={styles.dietTitle}>Minha Dieta</Text>
            <View style={styles.editIcon}>
              <Text style={styles.editIconText}>✏️</Text>
            </View>
          </View>

          <View style={styles.metaSection}>
            <Text style={styles.metaLabel}>🎯 META:</Text>
            <Text style={styles.metaText}>Quero perder peso! 💪🔥</Text>
          </View>

          <View style={styles.foodSection}>
            <Text style={styles.foodAllowed}>
              ✅ Carnes, ovos, azeites, castanhas, queijos e vegetais de baixo carboidrato
            </Text>
            <Text style={styles.foodRestricted}>
              🚫 Pães, massas, açúcar e grãos ricos em carboidratos
            </Text>
          </View>

          <Text style={styles.editTip}>
            Lembre-se você pode editar sua dieta quando quiser.
          </Text>
        </TouchableOpacity>

        {/* Refeições and Calorias Row */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.card, styles.cardLeft]}
            onPress={() => navigateTo('refeicoes')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🍴</Text>
              <Text style={styles.cardTitle}>Refeições</Text>
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealTime}>🕐 ÚLTIMA REFEIÇÃO: Almoço</Text>
              <Text style={styles.mealDetail}>⏰ 12 de dez - 15:30</Text>
              <Text style={styles.mealDetail}>🍽️ Arroz de atum + 968 kcal</Text>
              <Text style={styles.mealDetail}>📍 Salvador - Bahia</Text>
            </View>
            <Text style={styles.mealFooter}>
              📊 Registre sua refeição
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.cardRight]}
            onPress={() => navigateTo('calorias')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🔥</Text>
              <Text style={styles.cardTitle}>Calorias</Text>
            </View>
            <View style={styles.pieChartPlaceholder}>
              <View style={styles.pieSlice1} />
              <View style={styles.pieSlice2} />
              <View style={styles.pieSlice3} />
            </View>
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieConsumed}>⬇️ 10.320</Text>
              <Text style={styles.calorieBurned}>🔥 450kcal</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Progresso and Histórico Row */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.card, styles.cardLeft]}
            onPress={() => navigateTo('progresso')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📊</Text>
              <Text style={styles.cardTitle}>Progresso</Text>
            </View>
            <View style={styles.chartPlaceholder}>
              <View style={styles.chartBar1} />
              <View style={styles.chartBar2} />
              <View style={styles.chartBar3} />
              <View style={styles.chartBar4} />
              <View style={styles.chartBar5} />
            </View>
            <Text style={styles.progressFooter}>
              📈 2 semanas sem recaídas!
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.cardRight]}
            onPress={() => navigateTo('historico')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⏱️</Text>
              <Text style={styles.cardTitle}>Histórico</Text>
            </View>
            <View style={styles.historicoContent}>
              <Text style={styles.historicoItem}>
                📅 <Text style={styles.historicoLabel}>ÚLTIMA REFEIÇÃO:</Text>{' '}
                <Text style={styles.historicoGood}>Café da tarde</Text>
              </Text>
              <Text style={styles.historicoItem}>
                📅 <Text style={styles.historicoLabel}>Ontem:</Text>{' '}
                <Text style={styles.historicoBad}>+29 kcal (Abacaxi)</Text>
              </Text>
              <Text style={styles.historicoItem}>
                📅 <Text style={styles.historicoLabel}>Semana:</Text>{' '}
                <Text style={styles.historicoBad}>-20 kcal (Abacaxi)</Text>
              </Text>
            </View>
            <Text style={styles.historicoFooter}>
              📊 7 refeições perdidas nas últimas 2 semanas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Jejum Card */}
        <TouchableOpacity 
          style={styles.jejumCard}
          onPress={() => navigateTo('jejum')}
        >
          <View style={styles.jejumHeader}>
            <Text style={styles.jejumIcon}>⏰</Text>
            <Text style={styles.jejumTitle}>Jejum</Text>
          </View>
          <Text style={styles.jejumSubtitle}>Faltam</Text>
          <Text style={styles.jejumTime}>2 HORAS</Text>
          <Text style={styles.jejumDescription}>para sua próxima refeição</Text>
          <Text style={styles.jejumFooter}>
            ⏰ Dificuldade com o jejum intermitente? Ajuste suas preferências!
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 30,
  },
  profileButton: {
    width: 50,
    height: 50,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    borderWidth: 3,
    borderColor: '#FF1493',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
  },
  dietCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dietHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dietIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  dietTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00BFA5',
    flex: 1,
  },
  editIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 18,
  },
  metaSection: {
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  metaText: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  foodSection: {
    marginBottom: 10,
  },
  foodAllowed: {
    fontSize: 12,
    color: '#2E7D32',
    marginBottom: 5,
    lineHeight: 18,
  },
  foodRestricted: {
    fontSize: 12,
    color: '#C62828',
    lineHeight: 18,
  },
  editTip: {
    fontSize: 11,
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLeft: {
    flex: 1,
    marginRight: 7.5,
  },
  cardRight: {
    flex: 1,
    marginLeft: 7.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mealInfo: {
    marginBottom: 10,
  },
  mealTime: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  mealDetail: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  mealFooter: {
    fontSize: 10,
    color: '#757575',
    fontStyle: 'italic',
  },
  pieChartPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  pieSlice1: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#FF6B9D',
    borderRadius: 50,
  },
  pieSlice2: {
    position: 'absolute',
    width: 50,
    height: 100,
    right: 0,
    backgroundColor: '#FFD93D',
  },
  pieSlice3: {
    position: 'absolute',
    width: 100,
    height: 40,
    bottom: 0,
    backgroundColor: '#6BCB77',
  },
  calorieInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calorieConsumed: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieBurned: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  chartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 80,
    marginVertical: 10,
  },
  chartBar1: {
    width: 15,
    height: 30,
    backgroundColor: '#4FC3F7',
    borderRadius: 3,
  },
  chartBar2: {
    width: 15,
    height: 50,
    backgroundColor: '#4FC3F7',
    borderRadius: 3,
  },
  chartBar3: {
    width: 15,
    height: 70,
    backgroundColor: '#4FC3F7',
    borderRadius: 3,
  },
  chartBar4: {
    width: 15,
    height: 45,
    backgroundColor: '#4FC3F7',
    borderRadius: 3,
  },
  chartBar5: {
    width: 15,
    height: 60,
    backgroundColor: '#4FC3F7',
    borderRadius: 3,
  },
  progressFooter: {
    fontSize: 10,
    color: '#757575',
    textAlign: 'center',
  },
  historicoContent: {
    marginBottom: 8,
  },
  historicoItem: {
    fontSize: 11,
    color: '#333',
    marginBottom: 4,
  },
  historicoLabel: {
    fontWeight: 'bold',
  },
  historicoGood: {
    color: '#2E7D32',
  },
  historicoBad: {
    color: '#C62828',
  },
  historicoFooter: {
    fontSize: 10,
    color: '#757575',
    fontStyle: 'italic',
  },
  jejumCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jejumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  jejumIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  jejumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  jejumSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  jejumTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 5,
  },
  jejumDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  jejumFooter: {
    fontSize: 11,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
