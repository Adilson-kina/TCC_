import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function heightPercent(percentage) {
  return windowHeight * (percentage / 100);
}

function widthPercent(percentage) {
  return windowWidth * (percentage / 100);
}

const API_BASE = 'https://tcc-production-b4f7.up.railway.app/PHP';

export default function PerguntasPerfil() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [dadosCalculados, setDadosCalculados] = useState(null);
  const [enviando, setEnviando] = useState(false);
  
  // Estados das respostas
  const [objetivo, setObjetivo] = useState('');
  const [valorDesejado, setValorDesejado] = useState('');
  const [contagemCalorica, setContagemCalorica] = useState('');
  const [jejumIntermitente, setJejumIntermitente] = useState('');
  const [nivelAtividade, setNivelAtividade] = useState('');
  const [comerFds, setComerFds] = useState('');
  const [tipoDieta, setTipoDieta] = useState('');
  const [disturbios, setDisturbios] = useState([]);
  const [possuiDieta, setPossuiDieta] = useState('');

  useEffect(() => {
    buscarDadosCalculados();
  }, []);

  const buscarDadosCalculados = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('Token não encontrado. Faça login novamente.');
        return;
      }
      
      const response = await fetch(`${API_BASE}/perguntas/perguntas_perfil.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.peso_recomendado_min && data.peso_recomendado_max) {
        setDadosCalculados(data);
        console.log('Dados calculados recebidos:', data);
      } else {
        console.log('Resposta da API:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setErrorMessage('Erro ao buscar dados calculados. Tente novamente.');
    }
  };

  const toggleDisturbio = (valor) => {
    if (disturbios.includes(valor)) {
      setDisturbios(disturbios.filter(d => d !== valor));
    } else {
      setDisturbios([...disturbios, valor]);
    }
  };

  const handleAvancar = () => {
    setErrorMessage('');
    
    // Validações por etapa
    if (etapa === 1 && !objetivo) {
      setErrorMessage('Por favor, selecione seu objetivo.');
      return;
    }
    
    if (etapa === 2 && (objetivo === 'perder' || objetivo === 'ganhar') && !valorDesejado) {
      setErrorMessage('Por favor, informe o peso desejado.');
      return;
    }
    
    if (etapa === 3 && !contagemCalorica) {
      setErrorMessage('Por favor, selecione uma opção.');
      return;
    }
    
    if (etapa === 4 && !jejumIntermitente) {
      setErrorMessage('Por favor, selecione uma opção.');
      return;
    }
    
    if (etapa === 5 && !nivelAtividade) {
      setErrorMessage('Por favor, selecione seu nível de atividade.');
      return;
    }
    
    if (etapa === 6 && !comerFds) {
      setErrorMessage('Por favor, selecione uma opção.');
      return;
    }

    if (etapa === 7 && !possuiDieta) {
      setErrorMessage('Por favor, selecione uma opção.');
      return;
    }
    
    // Etapa 8 (tipo de dieta) não é obrigatória
    
    // Etapa 9 (distúrbios) não é obrigatória

    if (etapa === 9) {
      if (!enviando) {
        enviarDados();
      }
    } else {
      setEtapa(etapa + 1);
    }
  };

  const enviarDados = async () => {
    if (enviando) return;
    
    setEnviando(true);
    
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('Token não encontrado. Faça login novamente.');
        return;
      }
      
      const disturbiosParaEnviar = disturbios.length === 0 ? ['nenhuma'] : disturbios;
      
      const payload = {
        objetivo: objetivo,
        contagem_calorica: contagemCalorica,
        jejum_intermitente: jejumIntermitente,
        nivel_atividade: nivelAtividade,
        tipo_dieta: tipoDieta || 'nenhuma',
        comer_fds: comerFds,
        disturbios: disturbiosParaEnviar,
        possui_dieta: possuiDieta,
        faixa_recomendada: dadosCalculados ? `${dadosCalculados.peso_recomendado_min}-${dadosCalculados.peso_recomendado_max}` : ''
      };

      if (objetivo === 'perder' || objetivo === 'ganhar') {
        payload.valor_desejado = parseFloat(valorDesejado);
      } else if (objetivo === 'manter' && dadosCalculados) {
        payload.valor_desejado = dadosCalculados.peso_atual || dadosCalculados.peso_recomendado_min;
      } else {
        payload.valor_desejado = null;
      }

      const response = await fetch(`${API_BASE}/perguntas/perguntas_perfil.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.erro) {
        setErrorMessage(data.erro);
        setEnviando(false);
      } else if (data.mensagem) {
        await fetch(`${API_BASE}/alimentos/alimentos.php`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        router.push('/home');
        console.log('Navegando para home...');
        setEnviando(false);
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      setErrorMessage('Erro ao enviar dados. Tente novamente.');
      setEnviando(false);
    }
  };

  const handleVoltar = () => {
    if (etapa > 1) {
      setEtapa(etapa - 1);
      setErrorMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* ETAPA 1: OBJETIVO */}
          {etapa === 1 && (
            <>
              <Text style={styles.pergunta}>Qual meta você{'\n'}deseja alcançar com{'\n'}sua dieta?</Text>
              
              <Pressable 
                style={[styles.opcao, objetivo === 'perder' && styles.opcaoSelecionada]}
                onPress={() => setObjetivo('perder')}
              >
                <View style={styles.radio}>
                  {objetivo === 'perder' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Quero perder peso! 🏃‍♂️🔥</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, objetivo === 'ganhar' && styles.opcaoSelecionada]}
                onPress={() => setObjetivo('ganhar')}
              >
                <View style={styles.radio}>
                  {objetivo === 'ganhar' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Quero ganhar peso! 🍽️🍔</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, objetivo === 'manter' && styles.opcaoSelecionada]}
                onPress={() => setObjetivo('manter')}
              >
                <View style={styles.radio}>
                  {objetivo === 'manter' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Manter meu peso! ✨👌</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, objetivo === 'massa' && styles.opcaoSelecionada]}
                onPress={() => setObjetivo('massa')}
              >
                <View style={styles.radio}>
                  {objetivo === 'massa' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Ganhar massa muscular! 🏋️‍♂️💥</Text>
              </Pressable>
            </>
          )}

          {/* ETAPA 2: PESO DESEJADO */}
          {etapa === 2 && (
            <>
              {(objetivo === 'perder' || objetivo === 'ganhar') ? (
                <>
                  <Text style={styles.pergunta}>Qual peso você{'\n'}deseja alcançar?</Text>
                  
                  {dadosCalculados && (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTexto}>
                        💡 Seu peso atual: {dadosCalculados.peso_atual || 'N/A'} kg
                      </Text>
                      <Text style={styles.infoTexto}>
                        ✅ Faixa recomendada: {dadosCalculados.peso_recomendado_min} - {dadosCalculados.peso_recomendado_max} kg
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.inputNumero}
                      placeholder="65.5"
                      placeholderTextColor="#747474"
                      value={valorDesejado}
                      onChangeText={setValorDesejado}
                      keyboardType="decimal-pad"
                      maxLength={5}
                    />
                    <Text style={styles.unidade}>kg</Text>
                  </View>
                  
                  <Text style={styles.dica}>
                    ⚖️ Exemplo: 70.5 kg
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.pergunta}>Ótima escolha!{'\n'}Vamos continuar...</Text>
                  <Text style={styles.dica}>
                    👉 Toque em "Avançar" para continuar
                  </Text>
                </>
              )}
            </>
          )}

          {/* ETAPA 3: CONTAGEM CALÓRICA */}
          {etapa === 3 && (
            <>
              <Text style={styles.pergunta}>Você já fez{'\n'}contagem calórica?</Text>
              
              <Pressable 
                style={[styles.opcao, contagemCalorica === 'sim' && styles.opcaoSelecionada]}
                onPress={() => setContagemCalorica('sim')}
              >
                <View style={styles.radio}>
                  {contagemCalorica === 'sim' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Sim</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, contagemCalorica === 'nao' && styles.opcaoSelecionada]}
                onPress={() => setContagemCalorica('nao')}
              >
                <View style={styles.radio}>
                  {contagemCalorica === 'nao' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Não</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, contagemCalorica === 'nao_sei' && styles.opcaoSelecionada]}
                onPress={() => setContagemCalorica('nao_sei')}
              >
                <View style={styles.radio}>
                  {contagemCalorica === 'nao_sei' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Não sei</Text>
              </Pressable>

              {contagemCalorica === 'nao_sei' && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoTitulo}>💡 O que é contagem calórica?</Text>
                  <Text style={styles.infoTexto}>
                    É o controle da quantidade de calorias que você consome por dia. Nosso app calcula automaticamente seu limite diário ideal baseado no seu objetivo!
                  </Text>
                  <Text style={styles.infoTexto}>
                    ✨ Você poderá acompanhar suas calorias consumidas vs. gastas em tempo real.
                  </Text>
                </View>
              )}
            </>
          )}

          {/* ETAPA 4: JEJUM INTERMITENTE */}
          {etapa === 4 && (
            <>
              <Text style={styles.pergunta}>Você pratica ou{'\n'}deseja praticar{'\n'}jejum intermitente?</Text>
              
              <Pressable 
                style={[styles.opcao, jejumIntermitente === 'sim' && styles.opcaoSelecionada]}
                onPress={() => setJejumIntermitente('sim')}
              >
                <View style={styles.radio}>
                  {jejumIntermitente === 'sim' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Sim</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, jejumIntermitente === 'nao' && styles.opcaoSelecionada]}
                onPress={() => setJejumIntermitente('nao')}
              >
                <View style={styles.radio}>
                  {jejumIntermitente === 'nao' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Não</Text>
              </Pressable>

              <View style={[styles.infoBox, styles.alertBox]}>
                <Text style={styles.alertTitulo}>⚠️ Importante sobre o jejum</Text>
                <Text style={styles.infoTexto}>
                  O jejum intermitente pode trazer riscos se não for feito com acompanhamento adequado. Por isso, esse recurso vem <Text style={styles.destaque}>desativado por padrão</Text> no app.
                </Text>
                <Text style={styles.infoTexto}>
                  💡 Você poderá ativá-lo manualmente nas configurações quando desejar, mas recomendamos consultar um profissional de saúde primeiro.
                </Text>
              </View>
            </>
          )}

          {/* ETAPA 5: NÍVEL DE ATIVIDADE */}
          {etapa === 5 && (
            <>
              <Text style={styles.pergunta}>Qual é o seu{'\n'}nível de atividade{'\n'}física?</Text>
              
              <Pressable 
                style={[styles.opcao, nivelAtividade === 'sedentario' && styles.opcaoSelecionada]}
                onPress={() => setNivelAtividade('sedentario')}
              >
                <View style={styles.radio}>
                  {nivelAtividade === 'sedentario' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Sedentário</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, nivelAtividade === 'baixo' && styles.opcaoSelecionada]}
                onPress={() => setNivelAtividade('baixo')}
              >
                <View style={styles.radio}>
                  {nivelAtividade === 'baixo' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Baixo (1-2x/semana)</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, nivelAtividade === 'medio' && styles.opcaoSelecionada]}
                onPress={() => setNivelAtividade('medio')}
              >
                <View style={styles.radio}>
                  {nivelAtividade === 'medio' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Médio (3-5x/semana)</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, nivelAtividade === 'alto' && styles.opcaoSelecionada]}
                onPress={() => setNivelAtividade('alto')}
              >
                <View style={styles.radio}>
                  {nivelAtividade === 'alto' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Alto (6-7x/semana)</Text>
              </Pressable>
            </>
          )}

          {/* ETAPA 6: COMER FDS */}
          {etapa === 6 && (
            <>
              <Text style={styles.pergunta}>Você costuma{'\n'}comer mais nos{'\n'}fins de semana?</Text>
              
              <Pressable 
                style={[styles.opcao, comerFds === 'sim' && styles.opcaoSelecionada]}
                onPress={() => setComerFds('sim')}
              >
                <View style={styles.radio}>
                  {comerFds === 'sim' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Sim</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, comerFds === 'nao' && styles.opcaoSelecionada]}
                onPress={() => setComerFds('nao')}
              >
                <View style={styles.radio}>
                  {comerFds === 'nao' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Não</Text>
              </Pressable>
            </>
          )}

          {/* ETAPA 7: POSSUI DIETA */}
          {etapa === 7 && (
            <>
              <Text style={styles.pergunta}>Você já possui{'\n'}uma dieta definida{'\n'}por profissional?</Text>
              
              <Pressable 
                style={[styles.opcao, possuiDieta === 'sim' && styles.opcaoSelecionada]}
                onPress={() => setPossuiDieta('sim')}
              >
                <View style={styles.radio}>
                  {possuiDieta === 'sim' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Sim, tenho</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, possuiDieta === 'nao' && styles.opcaoSelecionada]}
                onPress={() => setPossuiDieta('nao')}
              >
                <View style={styles.radio}>
                  {possuiDieta === 'nao' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Não, não tenho</Text>
              </Pressable>

              <Pressable 
                style={[styles.opcao, possuiDieta === 'nao_sei' && styles.opcaoSelecionada]}
                onPress={() => setPossuiDieta('nao_sei')}
              >
                <View style={styles.radio}>
                  {possuiDieta === 'nao_sei' && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Não sei</Text>
              </Pressable>
            </>
          )}

          {/* ETAPA 8: TIPO DE DIETA */}
          {etapa === 8 && (
            <>
              <Text style={styles.pergunta}>Você segue alguma{'\n'}dieta específica?</Text>
              
              <ScrollView 
              style={styles.scrollOpcoes}
              showsVerticalScrollIndicator={true}
              >
                <Pressable 
                style={[styles.opcao, (tipoDieta === '' || tipoDieta === 'nenhuma') && styles.opcaoSelecionada]}
                onPress={() => setTipoDieta('')}
              >
                <View style={styles.radio}>
                  {(tipoDieta === '' || tipoDieta === 'nenhuma') && <View style={styles.radioSelecionado} />}
                </View>
                <Text style={styles.opcaoTexto}>Nenhuma dieta específica</Text>
              </Pressable>

                <Pressable 
                  style={[styles.opcao, tipoDieta === 'low_carb' && styles.opcaoSelecionada]}
                  onPress={() => setTipoDieta('low_carb')}
                >
                  <View style={styles.radio}>
                    {tipoDieta === 'low_carb' && <View style={styles.radioSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Low Carb</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, tipoDieta === 'cetogenica' && styles.opcaoSelecionada]}
                  onPress={() => setTipoDieta('cetogenica')}
                >
                  <View style={styles.radio}>
                    {tipoDieta === 'cetogenica' && <View style={styles.radioSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Cetogênica</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, tipoDieta === 'mediterranea' && styles.opcaoSelecionada]}
                  onPress={() => setTipoDieta('mediterranea')}
                >
                  <View style={styles.radio}>
                    {tipoDieta === 'mediterranea' && <View style={styles.radioSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Mediterrânea</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, tipoDieta === 'vegana' && styles.opcaoSelecionada]}
                  onPress={() => setTipoDieta('vegana')}
                >
                  <View style={styles.radio}>
                    {tipoDieta === 'vegana' && <View style={styles.radioSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Vegana</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, tipoDieta === 'vegetariana' && styles.opcaoSelecionada]}
                  onPress={() => setTipoDieta('vegetariana')}
                >
                  <View style={styles.radio}>
                    {tipoDieta === 'vegetariana' && <View style={styles.radioSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Vegetariana</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, tipoDieta === 'paleolitica' && styles.opcaoSelecionada]}
                  onPress={() => setTipoDieta('paleolitica')}
                >
                  <View style={styles.radio}>
                    {tipoDieta === 'paleolitica' && <View style={styles.radioSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Paleolítica</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, tipoDieta === 'dieta_das_zonas' && styles.opcaoSelecionada]}
                  onPress={() => setTipoDieta('dieta_das_zonas')}
                >
                  <View style={styles.radio}>
                    {tipoDieta === 'dieta_das_zonas' && <View style={styles.radioSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Dieta das Zonas</Text>
                </Pressable>
              </ScrollView>
            </>
          )}

          {/* ETAPA 9: DISTÚRBIOS */}
          {etapa === 9 && (
            <>
              <Text style={styles.pergunta}>Você possui alguma{'\n'}doença ou restrição{'\n'}alimentar?</Text>
              <Text style={styles.dica}>
                💡 Selecione todas que se aplicam
              </Text>
              
              <ScrollView style={styles.scrollOpcoes}>
                <Pressable 
                  style={[styles.opcao, disturbios.includes('celíaca') && styles.opcaoSelecionada]}
                  onPress={() => toggleDisturbio('celíaca')}
                >
                  <View style={styles.checkbox}>
                    {disturbios.includes('celíaca') && <View style={styles.checkboxSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Doença Celíaca</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, disturbios.includes('diabetes') && styles.opcaoSelecionada]}
                  onPress={() => toggleDisturbio('diabetes')}
                >
                  <View style={styles.checkbox}>
                    {disturbios.includes('diabetes') && <View style={styles.checkboxSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Diabetes</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, disturbios.includes('hipercolesterolemia') && styles.opcaoSelecionada]}
                  onPress={() => toggleDisturbio('hipercolesterolemia')}
                >
                  <View style={styles.checkbox}>
                    {disturbios.includes('hipercolesterolemia') && <View style={styles.checkboxSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Hipercolesterolemia</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, disturbios.includes('hipertensão') && styles.opcaoSelecionada]}
                  onPress={() => toggleDisturbio('hipertensão')}
                >
                  <View style={styles.checkbox}>
                    {disturbios.includes('hipertensão') && <View style={styles.checkboxSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Hipertensão</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, disturbios.includes('sii') && styles.opcaoSelecionada]}
                  onPress={() => toggleDisturbio('sii')}
                >
                  <View style={styles.checkbox}>
                    {disturbios.includes('sii') && <View style={styles.checkboxSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Síndrome do Intestino Irritável (SII)</Text>
                </Pressable>

                <Pressable 
                  style={[styles.opcao, disturbios.includes('intolerancia_lactose') && styles.opcaoSelecionada]}
                  onPress={() => toggleDisturbio('intolerancia_lactose')}
                >
                  <View style={styles.checkbox}>
                    {disturbios.includes('intolerancia_lactose') && <View style={styles.checkboxSelecionado} />}
                  </View>
                  <Text style={styles.opcaoTexto}>Intolerância à Lactose</Text>
                </Pressable>
              </ScrollView>
            </>
          )}

          {errorMessage ? (
            <Text style={styles.erro}>{errorMessage}</Text>
          ) : null}

          <View style={styles.botoesContainer}>
            {etapa > 1 && (
              <Pressable style={styles.botaoVoltar} onPress={handleVoltar}>
                <Text style={styles.botaoVoltarTexto}>← Voltar</Text>
              </Pressable>
            )}
            
            <Pressable 
              style={[
                styles.botaoAvancar, 
                etapa === 1 && styles.botaoAvancarFull,
                enviando && styles.botaoDesabilitado
              ]}
              onPress={handleAvancar}
              disabled={enviando}
            >
              <Text style={styles.botaoTexto}>
                {enviando ? 'Enviando...' : (etapa === 9 ? 'Finalizar' : 'Avançar')}
              </Text>
            </Pressable>
          </View>

          {/* Indicador de progresso */}
          <View style={styles.progressoContainer}>
            {[...Array(9)].map((_, i) => (
              <View 
                key={i} 
                style={[styles.bolinha, etapa >= i + 1 && styles.bolinhaAtiva]} 
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  infoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },

  alertBox: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FBC02D',
  },

  destaque: {
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  alertTitulo: {
    fontSize: 16,  // adicione isso
    fontWeight: 'bold',  // adicione isso
    marginBottom: 8,  // adicione isso para dar espaço
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#ecfcec',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  formulario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ecfcec',
    width: widthPercent(90),  // era 85
    borderRadius: 20,
    padding: 20,  // era 30
    elevation: 5,
    maxHeight: heightPercent(80),
  },
  pergunta: {
    fontSize: 20,  // era 24
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 25,  // era 30
    lineHeight: 28,  // era 32
  },
  scrollOpcoes: {
    maxHeight: heightPercent(40),
    paddingRight: 5,  // adicione isso para dar espaço para o scroll
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,  // era 18
    borderRadius: 15,
    marginBottom: 12,  // era 15
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  opcaoSelecionada: {
    backgroundColor: '#C8E6C9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelecionado: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelecionado: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
  },
  opcaoTexto: {
    fontSize: 16,  // era 18
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007912',
    minWidth: 100,
    textAlign: 'center',
  },
  unidade: {
    fontSize: 24,
    color: '#666',
    marginLeft: 10,
    fontWeight: '500',
  },
  dica: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#FFF9C4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  infoTexto: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontWeight: '500',
  },
  erro: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '500',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  botaoVoltar: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  botaoVoltarTexto: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoAvancar: {
    flex: 1,
    backgroundColor: '#007912',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  botaoAvancarFull: {
    flex: 1,
  },
  botaoDesabilitado: {
    backgroundColor: '#9E9E9E',
    opacity: 0.6,
  },
  botaoTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  bolinha: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C8E6C9',
  },
  bolinhaAtiva: {
    backgroundColor: '#007912',
  },
});