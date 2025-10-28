import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE = 'https://tcc-production-b4f7.up.railway.app/PHP';

export default function Home() {
  const router = useRouter();
  const [jejumAtivo, setJejumAtivo] = useState<boolean | null>(null);
  const [avatarImagem, setAvatarImagem] = useState<number | null>(null);
  const [showJejumBlockModal, setShowJejumBlockModal] = useState(false);
  const [avatarCor, setAvatarCor] = useState('#FFFFFF');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jejumEmAndamento, setJejumEmAndamento] = useState(false);
  const [tempoRestanteJejum, setTempoRestanteJejum] = useState('--:--:--');
  const logo = require('./img/logo_icon.png');
  
  // Estados para os dados da API
  const [dadosInicio, setDadosInicio] = useState({
    dieta: {
      meta: '',
      restricoes: [],
      recomendados: []
    },
    atividade: {
      passos: 0,
      calorias_gastas: 0
    },
    ultima_refeicao: null
  });

  const preSelectedImages = [
    require('./img/avatar1.png'),
    require('./img/avatar2.png'),
    require('./img/avatar3.png'),
    require('./img/avatar4.png'),
    require('./img/avatar5.png'),
    require('./img/avatar6.png'),
  ];
  
  // Adicione esta função para carregar o avatar:
  const carregarAvatar = async () => {
    try {
      const imagemSalva = await AsyncStorage.getItem('avatarImagem');
      const corSalva = await AsyncStorage.getItem('avatarCor');
      
      if (imagemSalva !== null && imagemSalva !== '') {
        setAvatarImagem(parseInt(imagemSalva));
      }
      if (corSalva !== null) {
        setAvatarCor(corSalva);
      }
    } catch (error) {
      console.error('Erro ao carregar avatar:', error);
    }
  };

  // REMOVA todo aquele useEffect com setInterval e substitua por:
  useEffect(() => {
      carregarDados();
      carregarAvatar();
      verificarStatusJejum();
      verificarJejumEmAndamento();
    }, []);

    useEffect(() => {
      let interval: NodeJS.Timeout;
      
      if (jejumEmAndamento) {
        interval = setInterval(async () => {
          const jejumData = await AsyncStorage.getItem('jejumData');
          if (jejumData) {
            const data = JSON.parse(jejumData);
            calcularTempoRestanteHome(
              new Date(data.horaInicio),
              data.duracaoHoras,
              data.duracaoMinutos
            );
          }
        }, 1000);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [jejumEmAndamento]);

  useFocusEffect(
    React.useCallback(() => {
      carregarAvatar();
      carregarDados();
      verificarStatusJejum(); 
      verificarJejumEmAndamento();
    }, [])
  );

  const verificarStatusJejum = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.error('Token não encontrado');
        return;
      }

      const response = await fetch(`${API_BASE}/jejum.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('📊 Dados do jejum:', data);

      // CORRETO: acessar data.jejum_ativo diretamente
      if (data.mensagem) {
        setJejumAtivo(data.jejum_ativo);
        console.log('✅ Jejum ativo:', data.jejum_ativo);
      } else if (data.erro) {
        console.error('Erro ao verificar jejum:', data.erro);
      }
    } catch (error) {
      console.error('Erro ao verificar status do jejum:', error);
    }
  };

  const verificarJejumEmAndamento = async () => {
    try {
      const jejumData = await AsyncStorage.getItem('jejumData');
      if (jejumData) {
        const data = JSON.parse(jejumData);
        const horaInicio = new Date(data.horaInicio);
        const agora = new Date();
        const duracaoMs = (data.duracaoHoras * 60 + data.duracaoMinutos) * 60 * 1000;
        const fimJejum = new Date(horaInicio.getTime() + duracaoMs);

        if (agora < fimJejum) {
          setJejumEmAndamento(true);
          calcularTempoRestanteHome(horaInicio, data.duracaoHoras, data.duracaoMinutos);
        } else {
          setJejumEmAndamento(false);
          await AsyncStorage.removeItem('jejumData');
        }
      } else {
        setJejumEmAndamento(false);
      }
    } catch (error) {
      console.error('Erro ao verificar jejum:', error);
    }
  };

    const calcularTempoRestanteHome = (horaInicio: Date, duracaoHoras: number, duracaoMinutos: number) => {
      const agora = new Date();
      const duracaoMs = (duracaoHoras * 60 + duracaoMinutos) * 60 * 1000;
      const fimJejum = new Date(horaInicio.getTime() + duracaoMs);
      const diff = fimJejum.getTime() - agora.getTime();

      if (diff <= 0) {
        setTempoRestanteJejum('00:00:00');
        setJejumEmAndamento(false);
        AsyncStorage.removeItem('jejumData');
        return;
      }

      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diff % (1000 * 60)) / 1000);

      setTempoRestanteJejum(
        `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
      );
    };

  const handleAcceptTermsHome = async () => {
    console.log('🔵 Iniciando handleAcceptTermsHome');
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔵 Token obtido:', token ? 'existe' : 'não existe');
      
      if (!token) {
        console.error('❌ Token não encontrado');
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        return;
      }

      console.log('🔵 Fazendo requisição PUT para:', `${API_BASE}/jejum.php`);
      
      const response = await fetch(`${API_BASE}/jejum.php`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jejum_ativo: 1 })
      });

      console.log('🔵 Response status:', response.status);
      
      const data = await response.json();
      console.log('🔵 Response data:', JSON.stringify(data, null, 2));

      // CORRETO: verificar data.mensagem ao invés de data.sucesso
      if (data.mensagem && !data.erro) {
        console.log('✅ Jejum ativado com sucesso');
        setJejumAtivo(true);
        setShowTermsModal(false);
        router.push('/jejum');
      } else {
        console.error('❌ Erro da API:', data.erro || data.mensagem);
        Alert.alert('Erro', data.erro || 'Não foi possível ativar o jejum');
      }
    } catch (error) {
      console.error('❌ Erro ao aceitar termos:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor: ' + error.message);
    }
  };

  const handlePararJejumDaHome = async () => {
    try {
      await AsyncStorage.removeItem('jejumData');
      setJejumEmAndamento(false);
      setTempoRestanteJejum('00:00:00');
      setShowJejumBlockModal(false);
      Alert.alert('✅ Jejum Parado', 'Agora você pode registrar suas refeições normalmente!');
    } catch (error) {
      console.error('Erro ao parar jejum:', error);
      Alert.alert('Erro', 'Não foi possível parar o jejum');
    }
  };

  const handleRefeicoesPress = () => {
    if (jejumEmAndamento) {
      setShowJejumBlockModal(true);
    } else {
      router.push('/refeicoes');
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.error('Token não encontrado');
        return;
      }

      const response = await fetch(`${API_BASE}/inicio.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.mensagem) {
        setDadosInicio(data);
      } else if (data.erro) {
        console.error('Erro da API:', data.erro);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMeta = (meta) => {
    const metas = {
      'perder': 'Quero perder peso! 💪🔥',
      'ganhar': 'Quero ganhar peso! 💪🍗',
      'manter': 'Quero manter meu peso! 🎯',
      'massa': 'Quero ganhar massa muscular! 💪🏋️'
    };
    return metas[meta] || 'Meta não definida';
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    const dia = data.getDate().toString().padStart(2, '0');
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const mes = meses[data.getMonth()];
    const hora = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    return `${dia} de ${mes} - ${hora}:${minutos}`;
  };

  const formatarTipoRefeicao = (tipo) => {
    const tipos = {
      'cafe': 'Café da manhã',
      'almoco': 'Almoço',
      'janta': 'Janta',
      'lanche': 'Lanche'
    };
    return tipos[tipo] || tipo;
  };

  const formatarRefeicoes = (total: number) => {
    return total === 1 ? '1 refeição' : `${total} refeições`;
  };

  const handleJejumPress = () => {
    if (jejumAtivo === false || jejumAtivo === null) {
      setShowTermsModal(true);
    } else {
      router.push('/jejum');
    }
  };

  // Adicione esta função ANTES do return, junto com as outras funções:

  const getMensagemProgresso = () => {
    const historico = dadosInicio.progresso || [];
    
    if (historico.length === 0) {
      return '📊 Registre seu peso!';
    }
    
    if (historico.length === 1) {
      return '🎯 Primeiro passo dado!';
    }
    
    // Pegar primeiro e último peso para calcular tendência
    const pesoInicial = parseFloat(historico[0].peso);
    const pesoAtual = parseFloat(historico[historico.length - 1].peso);
    const diferenca = pesoAtual - pesoInicial;
    
    // Buscar a meta do usuário
    const meta = dadosInicio.dieta?.meta || '';
    
    // Mensagens baseadas na meta e progresso
    if (meta === 'perder') {
      if (diferenca < -2) return '🔥 Incrível! Perdendo peso demais!';
      if (diferenca < -1) return '💪 Ótimo progresso! Continue!';
      if (diferenca < -0.5) return '👍 No caminho certo!';
      if (diferenca <= 0.5) return '⚖️ Mantendo estável!';
      return '⚠️ Atenção ao peso!';
    }
    
    if (meta === 'ganhar' || meta === 'massa') {
      if (diferenca > 2) return '💪 Excelente ganho!';
      if (diferenca > 1) return '🏋️ Progresso sólido!';
      if (diferenca > 0.5) return '📈 Crescendo bem!';
      if (diferenca >= -0.5) return '⚖️ Mantendo estável!';
      return '⚠️ Cuidado, perdendo peso!';
    }
    
    if (meta === 'manter') {
      if (Math.abs(diferenca) <= 0.5) return '🎯 Perfeito! Peso mantido!';
      if (Math.abs(diferenca) <= 1) return '👍 Quase lá!';
      return '⚠️ Atenção às variações!';
    }
    
    return '📈 Continue assim!';
  };

  const renderMiniGrafico = () => {
    const historico = dadosInicio.progresso || [];
    
    if (historico.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.noDataText}>📊 Sem dados</Text>
          <Text style={[styles.noDataText, { fontSize: 10, marginTop: 5 }]}>
            Registre seu peso!
          </Text>
        </View>
      );
    }

    if (historico.length === 1) {
      return (
        <View style={styles.chartPlaceholder}>
          <View style={styles.singlePointContainer}>
            <View style={styles.singlePoint} />
            <Text style={styles.singlePointText}>
              {parseFloat(historico[0].peso).toFixed(1)}kg
            </Text>
          </View>
          <Text style={[styles.noDataText, { fontSize: 10, marginTop: 10 }]}>
            Continue registrando!
          </Text>
        </View>
      );
    }
    
    const pesos = historico.map(h => parseFloat(h.peso));
    const maxPeso = Math.max(...pesos);
    const minPeso = Math.min(...pesos);
    const range = maxPeso - minPeso || 1;

    const graphHeight = 70;  // 🔧 Reduzi de 80
    const graphWidth = 130;  // 🔧 Aumentei de 120
    const pointSpacing = historico.length > 1 ? graphWidth / (historico.length - 1) : 0;

    return (
      <View style={styles.chartPlaceholder}>
        <View style={{ width: graphWidth, height: graphHeight, position: 'relative' }}>
          {/* Linha do gráfico */}
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
                key={`line-${index}`}
                style={{
                  position: 'absolute',
                  width: length,
                  height: 3,
                  backgroundColor: '#4CAF50',
                  left: prevX,
                  top: prevY,
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: 'left center'
                }}
              />
            );
          })}

          {/* Pontos do gráfico */}
          {historico.map((item, index) => {
            const peso = parseFloat(item.peso);
            const y = graphHeight - ((peso - minPeso) / range) * graphHeight;
            const x = index * pointSpacing;
            
            return (
              <View 
                key={`point-${index}`}
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#4CAF50',
                  borderWidth: 2,
                  borderColor: '#FFF',
                  left: x - 5,
                  top: y - 5
                }}
              />
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10, color: 'white' }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
        <Image 
          source={logo}
          style={styles.logoImage}
        />
      </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/verPerfil')}
        >
          <View style={[styles.profilePhoto, { backgroundColor: avatarCor }]}>
            {avatarImagem !== null && (
              <Image 
                source={preSelectedImages[avatarImagem]} 
                style={styles.profileImage}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Minha Dieta Card */}
        <TouchableOpacity 
          style={styles.dietCard}
          onPress={() => router.push('/dieta')}
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
            <Text style={styles.metaText}>
              {formatarMeta(dadosInicio.dieta.meta)}
            </Text>
          </View>

          <View style={styles.alimentosSection}>
            <Text style={styles.alimentosLabel}>🍽️ Principais Alimentos:</Text>
            {dadosInicio.dieta.top_alimentos && dadosInicio.dieta.top_alimentos.length > 0 ? (
              dadosInicio.dieta.top_alimentos.map((alimento, index) => (
                <Text key={index} style={styles.alimentoItem}>
                  {index + 1}. {alimento.nome} - {parseFloat(alimento.valor).toFixed(1)}{alimento.unidade}
                </Text>
              ))
            ) : (
              <Text style={styles.alimentoItem}>Configure sua dieta primeiro</Text>
            )}
          </View>

          <Text style={styles.editTip}>
            Lembre-se você pode editar sua dieta quando quiser.
          </Text>
        </TouchableOpacity>

        {/* Refeições and Calorias Row */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[
              styles.card, 
              styles.cardLeft,
              jejumEmAndamento && styles.cardDisabled
            ]}
            onPress={handleRefeicoesPress}
            disabled={jejumEmAndamento}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardIcon, jejumEmAndamento && styles.textDisabled]}>🍴</Text>
              <Text style={[styles.cardTitle, jejumEmAndamento && styles.textDisabled]}>Refeições</Text>
            </View>
            
            {jejumEmAndamento ? (
              <View style={styles.blockedContent}>
                <Text style={styles.lockIconBig}>🔒</Text>
                <Text style={styles.blockedText}>Bloqueado</Text>
                <Text style={styles.blockedSubtext}>Jejum em andamento</Text>
              </View>
            ) : (
              <>
            
            <View style={styles.mealInfo}>
              <View style={styles.mealStatRow}>
                <Text style={styles.mealStatLabel}>📊 Refeições realizadas hoje:</Text>
                <Text style={styles.mealStatValue}>
                  {formatarRefeicoes(dadosInicio.refeicoes_hoje?.total || 0)}
                </Text>
              </View>
              
              <View style={styles.mealStatRow}>
                <Text style={styles.mealStatLabel}>🔥 Total de calorias consumidas:</Text>
                <Text style={styles.mealStatValue}>
                  {parseFloat(dadosInicio.refeicoes_hoje?.calorias_total || 0).toFixed(0)} kcal
                </Text>
              </View>
              
              <View style={[styles.mealStatRow, styles.nextMealRow]}>
                <Text style={styles.mealStatLabel}>⏰ Próxima refeição sugerida:</Text>
                <Text style={styles.nextMealValue}>
                  {dadosInicio.proxima_refeicao || 'Almoço'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.mealFooter}>
              ➕ Registrar nova refeição
            </Text>
            </>
          )}
        </TouchableOpacity>

          {/* O card de Calorias continua igual */}
          <TouchableOpacity 
            style={[styles.card, styles.cardRight]}
            onPress={() => router.push('/calorias')}
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
              <Text style={styles.calorieConsumed}>
                ⬇️ {parseInt(dadosInicio.atividade.passos || 0).toLocaleString('pt-BR')}
              </Text>
              <Text style={styles.mealDetail}>
                🔥 {parseFloat(dadosInicio.ultima_refeicao?.total_calorias || 0).toFixed(0)} kcal
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Progresso and Histórico Row */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.card, styles.cardLeft]}
            onPress={() => router.push('/progresso')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>📊</Text>
              <Text style={styles.cardTitle}>Progresso</Text>
            </View>
            
            {renderMiniGrafico()}
            
            <Text style={styles.progressFooter}>
              {getMensagemProgresso()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.cardRight]}
            onPress={() => router.push('/historico')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>⏱️</Text>
              <Text style={styles.cardTitle}>Histórico</Text>
            </View>
            
            {dadosInicio.ultima_refeicao ? (
              <View style={styles.historicoContent}>
                <Text style={styles.historicoItem}>
                  📅 <Text style={styles.historicoLabel}>ÚLTIMA REFEIÇÃO:</Text>{' '}
                  <Text style={styles.historicoGood}>
                    {formatarTipoRefeicao(dadosInicio.ultima_refeicao.tipo)}
                  </Text>
                </Text>
                <Text style={styles.historicoItem}>
                  📅 <Text style={styles.historicoLabel}>Data:</Text>{' '}
                  <Text style={styles.historicoGood}>
                    {formatarData(dadosInicio.ultima_refeicao.data)}
                  </Text>
                </Text>
                <Text style={styles.historicoItem}>
                  🍽️ <Text style={styles.historicoLabel}>Alimentos:</Text>{' '}
                  <Text style={styles.historicoGood}>
                    {dadosInicio.ultima_refeicao.alimentos.length} itens
                  </Text>
                </Text>
              </View>
            ) : (
              <View style={styles.historicoContent}>
                <Text style={styles.historicoItem}>
                  Nenhuma refeição registrada
                </Text>
              </View>
            )}
            
            <Text style={styles.historicoFooter}>
              📊 Veja seu histórico completo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Jejum Card */}
        <TouchableOpacity 
          style={[
            styles.jejumCard,
            (jejumAtivo === false || jejumAtivo === null) && styles.jejumCardDisabled
          ]}
          onPress={handleJejumPress}
        >
          <View style={styles.jejumHeader}>
            <Text style={styles.jejumIcon}>⏰</Text>
            <Text style={styles.jejumTitle}>Jejum</Text>
          </View>
          
          {(jejumAtivo === false || jejumAtivo === null) ? (
            <>
              <Text style={styles.jejumDisabledText}>🔒 Funcionalidade Desativada</Text>
              <Text style={styles.jejumDisabledSubtext}>
                Toque para ativar o jejum intermitente
              </Text>
            </>
          ) : jejumEmAndamento ? (
            <>
              <Text style={styles.jejumSubtitle}>Tempo restante:</Text>
              <Text style={styles.jejumTime}>{tempoRestanteJejum}</Text>
              <Text style={styles.jejumDescription}>para sua próxima refeição</Text>
            </>
          ) : (
            <>
              <Text style={styles.jejumSubtitle}>🎯 Jejum Ativo</Text>
              <Text style={styles.jejumDescription}>Toque para iniciar o contador</Text>
            </>
          )}
          
          <Text style={styles.jejumFooter}>
            {(jejumAtivo === false || jejumAtivo === null) 
              ? '⚠️ Leia o termo de ciência antes de ativar' 
              : jejumEmAndamento
                ? '⏱️ Jejum em andamento'
                : '⏰ Toque para gerenciar seu jejum'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modal de Bloqueio de Jejum */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showJejumBlockModal}
        onRequestClose={() => setShowJejumBlockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>⏰</Text>
            </View>
            
            <Text style={styles.modalTitle}>Jejum em Andamento</Text>
            
            <View style={styles.jejumModalInfo}>
              <Text style={styles.jejumModalText}>
                Você está no meio de um jejum intermitente e não pode registrar refeições no momento.
              </Text>
              
              <View style={styles.jejumModalTimeBox}>
                <Text style={styles.jejumModalTimeLabel}>Tempo restante:</Text>
                <Text style={styles.jejumModalTime}>{tempoRestanteJejum}</Text>
              </View>
              
              <Text style={styles.jejumModalSubtext}>
                Aguarde o término do jejum ou pare o contador para registrar refeições.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.acceptButton, { backgroundColor: '#F44336' }]}
                onPress={handlePararJejumDaHome}
              >
                <Text style={styles.acceptButtonText}>⏹ Parar Jejum</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={() => setShowJejumBlockModal(false)}
              >
                <Text style={styles.declineButtonText}>← Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.modalIconText}>⚠️</Text>
            </View>
            
            <Text style={styles.modalTitle}>Termo de Ciência</Text>
            
            <ScrollView style={styles.termsScroll} showsVerticalScrollIndicator={true}>
              <Text style={styles.termsText}>
                A funcionalidade de jejum vem desativada por padrão, pois, se mal utilizada, pode gerar 
                resultados indesejáveis. Por exemplo, o efeito sanfona.
              </Text>
              <Text style={styles.termsText}>
                Antes de ativá-la, certifique-se de que o jejum foi recomendado por seu nutricionista 
                e de que você está ciente de que a responsabilidade pelo uso da funcionalidade é 
                inteiramente sua.
              </Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={handleAcceptTermsHome}
              >
                <Text style={styles.acceptButtonText}>✓ Prosseguir</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.declineButtonText}>← Voltar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  textDisabled: {
    color: '#999',
  },
  blockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  lockIconBig: {
    fontSize: 48,
    marginBottom: 8,
  },
  blockedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 4,
  },
  blockedSubtext: {
    fontSize: 12,
    color: '#999',
  },
  jejumModalInfo: {
    marginBottom: 20,
  },
  jejumModalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  jejumModalTimeBox: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  jejumModalTimeLabel: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 5,
  },
  jejumModalTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F57C00',
    fontFamily: 'monospace',
  },
  jejumModalSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
    singlePointContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  singlePoint: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  singlePointText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 8,
  },
    noDataText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  alimentosSection: {
    marginBottom: 10,
  },
  alimentosLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  alimentoItem: {
    fontSize: 12,
    color: '#555',
    marginBottom: 3,
  },
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  mealStatRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
  paddingHorizontal: 4,
},
  mealStatLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  mealStatValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  nextMealRow: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  nextMealValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15, // SUBSTITUI o paddingTop e paddingBottom
    backgroundColor: '#4CAF50',
    minHeight: 100, // ADICIONA altura mínima
  },
  logoContainer: {
    width: 70, // AUMENTEI MUITO de 50
    height: 70, // AUMENTEI MUITO de 50
    borderRadius: 15, // Aumentei o arredondamento
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%', // Reduzi de 80% para dar mais espaço
    height: '100%',
    resizeMode: 'contain',
  },
  profileButton: {
    width: 70, // AUMENTEI MUITO de 50
    height: 70,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePhoto: {
    width: 70, // AUMENTEI MUITO de 50
    height: 70,
    borderRadius: 35, // Metade de 70
    borderWidth: 1, // Aumentei de 3
    borderColor: '#000000', // Mudei para branco como na imagem
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 180,
    justifyContent: 'space-between',  // 🆕 ADICIONAR
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
    fontSize: 18,  // AUMENTADO de 16
    fontWeight: 'bold',
    color: '#333',
  },
  mealInfo: {
    marginBottom: 10,
  },
  mealTime: {
    fontSize: 13,  // AUMENTADO de 11
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,  // AUMENTADO de 3
  },
  mealDetail: {
    fontSize: 12,  // AUMENTADO de 10
    color: '#666',
    marginBottom: 4,  // AUMENTADO de 2
    lineHeight: 18,  // 🆕 ADICIONAR espaçamento entre linhas
  },
  mealFooter: {
    fontSize: 11,  // 🆕 REDUZIR para 11 (igual ao do card de dieta)
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 'auto',  // 🆕 ADICIONAR para empurrar para baixo
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
    fontSize: 13,  // AUMENTADO de 11
    fontWeight: 'bold',
    color: '#333',
  },
  calorieBurned: {
    fontSize: 13,  // AUMENTADO de 11
    fontWeight: 'bold',
    color: '#FF5722',
  },
  chartPlaceholder: {
    alignItems: 'center',      // 🔧 Centraliza horizontalmente
    justifyContent: 'center',  // 🔧 Centraliza verticalmente
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
    fontSize: 12,  // AUMENTADO de 10
    color: '#757575',
    textAlign: 'center',
    marginTop: 5,  // 🆕 ADICIONAR
  },
  historicoContent: {
    marginBottom: 8,
  },
  historicoItem: {
    fontSize: 13,  // AUMENTADO de 11
    color: '#333',
    marginBottom: 6,  // AUMENTADO de 4
    lineHeight: 18,  // 🆕 ADICIONAR
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
    fontSize: 12,  // AUMENTADO de 10
    color: '#757575',
    fontStyle: 'italic',
    marginTop: 8,  // 🆕 ADICIONAR
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
  jejumCardDisabled: {
  backgroundColor: '#F5F5F5',
  opacity: 0.7,
},
jejumDisabledText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#999',
  marginVertical: 10,
},
jejumDisabledSubtext: {
  fontSize: 14,
  color: '#666',
  textAlign: 'center',
  marginBottom: 10,
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