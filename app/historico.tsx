import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
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
}

interface Refeicao {
  refeicao_id: number;
  data_registro: string;
  tipo_refeicao: string;
  sintoma: string;
  alimentos: Alimento[];
}

export default function HistoricoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_BASE}/historico.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.refeicoes) {
        setRefeicoes(data.refeicoes);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const ano = data.getFullYear().toString().slice(-2);
    return `${dia}/${mes}/${ano}`;
  };

  const formatarTipoRefeicao = (tipo: string) => {
    const tipos = {
      'cafe': 'Café da manhã',
      'almoco': 'Almoço',
      'janta': 'Jantar',
      'lanche': 'Lanche'
    };
    return tipos[tipo] || tipo;
  };

  const formatarSintoma = (sintoma: string) => {
    const sintomas = {
      'nenhum': '✅ Sem sintomas',
      'azia': '🔥 Azia',
      'enjoo': '🤢 Enjoo',
      'diarreia': '💧 Diarreia',
      'dor_estomago': '😣 Dor de estômago'
    };
    return sintomas[sintoma] || sintoma;
  };

  const getCorSintoma = (sintoma: string) => {
    return sintoma === 'nenhum' ? '#4CAF50' : '#FF5722';
  };

  const calcularTotais = (alimentos: Alimento[]) => {
    let totalCalorias = 0;
    let totalCarbo = 0;
    let totalProteina = 0;

    alimentos.forEach(alimento => {
        const calorias = parseFloat(alimento.energia_kcal);
        const carbo = parseFloat(alimento.carboidrato_g);
        const proteina = parseFloat(alimento.proteina_g);
        
        if (!isNaN(calorias)) totalCalorias += calorias;
        if (!isNaN(carbo)) totalCarbo += carbo;
        if (!isNaN(proteina)) totalProteina += proteina;
    });

    return {
        calorias: totalCalorias > 0 ? totalCalorias.toFixed(0) : '0',
        carboidratos: totalCarbo > 0 ? totalCarbo.toFixed(1) : '0.0',
        proteinas: totalProteina > 0 ? totalProteina.toFixed(1) : '0.0'
    };
};

  const agruparPorData = () => {
    const grupos: { [key: string]: Refeicao[] } = {};
    
    refeicoes.forEach(refeicao => {
      const data = refeicao.data_registro;
      if (!grupos[data]) {
        grupos[data] = [];
      }
      grupos[data].push(refeicao);
    });

    return grupos;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  const grupos = agruparPorData();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⏱️ Histórico</Text>
        <View style={styles.placeholder} />
      </View>

      {refeicoes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Nenhuma refeição registrada</Text>
          <Text style={styles.emptySubtitle}>
            Comece registrando suas refeições para acompanhar seu histórico
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {Object.keys(grupos).map(data => (
            <View key={data} style={styles.dataGroup}>
              <View style={styles.dataHeader}>
                <Text style={styles.dataText}>📅 Data: {formatarData(data)}</Text>
              </View>

              {grupos[data].map((refeicao) => {
                const totais = calcularTotais(refeicao.alimentos);
                
                return (
                  <View key={refeicao.refeicao_id} style={styles.refeicaoCard}>
                    <View style={styles.refeicaoHeader}>
                      <Text style={styles.refeicaoTipo}>
                        {formatarTipoRefeicao(refeicao.tipo_refeicao)}
                      </Text>
                      <View style={[
                        styles.sintomaTag,
                        { backgroundColor: getCorSintoma(refeicao.sintoma) }
                      ]}>
                        <Text style={styles.sintomaText}>
                          {formatarSintoma(refeicao.sintoma)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.alimentosSection}>
                      <Text style={styles.alimentosTitle}>
                        🍽️ Alimentos ({refeicao.alimentos.length}):
                      </Text>
                      {refeicao.alimentos.map((alimento, index) => (
                        <View key={alimento.id} style={styles.alimentoRow}>
                          <Text style={styles.alimentoNome}>
                            • {alimento.nome}
                          </Text>
                          <Text style={styles.alimentoKcal}>
                            {!isNaN(parseFloat(alimento.energia_kcal)) 
                                ? parseFloat(alimento.energia_kcal).toFixed(0) 
                                : '0'} kcal
                            </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.totaisSection}>
                      <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>🔥 Calorias:</Text>
                        <Text style={styles.totalValue}>{totais.calorias} kcal</Text>
                      </View>
                      <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>🍞 Carboidratos:</Text>
                        <Text style={styles.totalValue}>{totais.carboidratos}g</Text>
                      </View>
                      <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>🥩 Proteínas:</Text>
                        <Text style={styles.totalValue}>{totais.proteinas}g</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingVertical: 15,
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
    fontSize: 28,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
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
  },
  dataGroup: {
    marginBottom: 20,
  },
  dataHeader: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  dataText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  refeicaoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 12,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refeicaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  refeicaoTipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sintomaTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sintomaText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  alimentosSection: {
    marginBottom: 12,
  },
  alimentosTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  alimentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  alimentoNome: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  alimentoKcal: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  totaisSection: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  totalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bottomPadding: {
    height: 20,
  },
});