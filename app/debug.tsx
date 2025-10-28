// app/debug.tsx
// Adicione esta tela temporária para testar a API

import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const API_BASE = 'https://dietase.xo.je/TCC/PHP';

interface TestResult {
  test: string;
  status: string;
  details: string;
  time: string;
}

export default function DebugScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, status: string, details: string) => {
    setResults(prev => [...prev, {
      test,
      status,
      details,
      time: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Teste 1: Conexão básica
  const testBasicConnection = async () => {
    setLoading(true);
    try {
      console.log('🔵 Testando conexão básica...');
      const response = await fetch(`${API_BASE}/test_api.php`, {
        method: 'GET',
      });
      
      console.log('🔵 Status:', response.status);
      const text = await response.text();
      console.log('🔵 Resposta:', text);
      
      const json = JSON.parse(text);
      addResult('Conexão Básica', '✅ OK', JSON.stringify(json, null, 2));
    } catch (error: any) {
      console.error('❌ Erro:', error);
      addResult('Conexão Básica', '❌ ERRO', error.message);
    }
    setLoading(false);
  };

  // Teste 2: POST simples
  const testSimplePost = async () => {
    setLoading(true);
    try {
      console.log('🔵 Testando POST simples...');
      const response = await fetch(`${API_BASE}/auth.php?endpoint=test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teste: 'dados de teste' })
      });
      
      console.log('🔵 Status:', response.status);
      const text = await response.text();
      console.log('🔵 Resposta:', text);
      
      addResult('POST Simples', '✅ OK', `Status: ${response.status}\n${text}`);
    } catch (error: any) {
      console.error('❌ Erro:', error);
      addResult('POST Simples', '❌ ERRO', error.message);
    }
    setLoading(false);
  };

  // Teste 3: Login (teste real)
  const testLogin = async () => {
    setLoading(true);
    try {
      console.log('🔵 Testando login...');
      const body = {
        email: 'teste@teste.com',
        senha: '123456'
      };
      console.log('🔵 Body:', JSON.stringify(body));
      
      const response = await fetch(`${API_BASE}/auth.php?endpoint=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body)
      });
      
      console.log('🔵 Status:', response.status);
      const text = await response.text();
      console.log('🔵 Resposta bruta:', text);
      
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        json = { erro: 'Resposta não é JSON', raw: text };
      }
      
      addResult('Login', response.ok ? '✅ OK' : '⚠️ AVISO', JSON.stringify(json, null, 2));
    } catch (error: any) {
      console.error('❌ Erro:', error);
      addResult('Login', '❌ ERRO', `${error.message}\n\nStack: ${error.stack}`);
    }
    setLoading(false);
  };

  // Teste 4: Timeout
  const testWithTimeout = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      console.log('🔵 Testando timeout (5s)...');
      const response = await fetch(`${API_BASE}/auth.php?endpoint=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'teste@teste.com', senha: '123456' }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      console.log('🔵 Resposta dentro do tempo:', response.status);
      addResult('Timeout (5s)', '✅ OK', `Respondeu em tempo. Status: ${response.status}`);
    } catch (error: any) {
      clearTimeout(timeout);
      console.error('❌ Erro:', error);
      
      if (error.name === 'AbortError') {
        addResult('Timeout (5s)', '❌ TIMEOUT', 'Servidor demorou mais de 5 segundos');
      } else {
        addResult('Timeout (5s)', '❌ ERRO', error.message);
      }
    }
    setLoading(false);
  };

  // Teste 5: Headers
  const testHeaders = async () => {
    setLoading(true);
    try {
      console.log('🔵 Testando headers...');
      const response = await fetch(`${API_BASE}/test_api.php`);
      
      const headers: any = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      console.log('🔵 Headers:', headers);
      addResult('Headers', '✅ OK', JSON.stringify(headers, null, 2));
    } catch (error: any) {
      console.error('❌ Erro:', error);
      addResult('Headers', '❌ ERRO', error.message);
    }
    setLoading(false);
  };

  // Teste 6: SSL
  const testSSL = async () => {
    setLoading(true);
    try {
      console.log('🔵 Testando SSL...');
      const response = await fetch(`${API_BASE}/test_api.php`);
      const isSecure = response.url.startsWith('https://');
      
      console.log('🔵 URL:', response.url);
      console.log('🔵 É HTTPS?', isSecure);
      
      addResult('SSL', isSecure ? '✅ HTTPS' : '⚠️ HTTP', 
        `URL: ${response.url}\nProtocolo: ${isSecure ? 'HTTPS' : 'HTTP'}`);
    } catch (error: any) {
      console.error('❌ Erro:', error);
      addResult('SSL', '❌ ERRO', error.message);
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    clearResults();
    await testBasicConnection();
    await testSimplePost();
    await testLogin();
    await testWithTimeout();
    await testHeaders();
    await testSSL();
    Alert.alert('✅ Concluído', 'Todos os testes foram executados!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Network Debugger</Text>
        <Text style={styles.subtitle}>API: {API_BASE}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonPrimary]}
          onPress={runAllTests}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>🚀 Executar Todos</Text>
          )}
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.buttonSmall, styles.buttonBlue]}
            onPress={testBasicConnection}
            disabled={loading}
          >
            <Text style={styles.buttonTextSmall}>1. Básico</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonSmall, styles.buttonOrange]}
            onPress={testSimplePost}
            disabled={loading}
          >
            <Text style={styles.buttonTextSmall}>2. POST</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonSmall, styles.buttonPurple]}
            onPress={testLogin}
            disabled={loading}
          >
            <Text style={styles.buttonTextSmall}>3. Login</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.buttonDanger]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>🗑️ Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Nenhum teste executado.{'\n'}Clique nos botões acima.
            </Text>
          </View>
        ) : (
          results.map((result, index) => (
            <View key={index} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTest}>{result.test}</Text>
                <Text style={styles.resultTime}>{result.time}</Text>
              </View>
              <Text style={[
                styles.resultStatus,
                { color: 
                  result.status.includes('✅') ? '#4CAF50' : 
                  result.status.includes('⚠️') ? '#FF9800' : '#F44336' 
                }
              ]}>
                {result.status}
              </Text>
              <View style={styles.resultDetails}>
                <Text style={styles.resultDetailsText}>{result.details}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>💡 Dicas:</Text>
        <Text style={styles.tipsText}>• Se "Básico" falhar: problema de rede</Text>
        <Text style={styles.tipsText}>• Se "POST" falhar: problema com método</Text>
        <Text style={styles.tipsText}>• Se "Login" falhar: problema no backend</Text>
        <Text style={styles.tipsText}>• Verifique o console do Metro para mais logs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  buttonContainer: {
    padding: 15,
    gap: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#4CAF50',
  },
  buttonDanger: {
    backgroundColor: '#F44336',
  },
  buttonSmall: {
    flex: 1,
    padding: 12,
  },
  buttonBlue: {
    backgroundColor: '#2196F3',
  },
  buttonOrange: {
    backgroundColor: '#FF9800',
  },
  buttonPurple: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultTime: {
    fontSize: 12,
    color: '#999',
  },
  resultStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultDetails: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  resultDetailsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  tips: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ffc107',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  tipsText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 2,
  },
});