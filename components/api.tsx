import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE = 'https://tcc-production-b4f7.up.railway.app/PHP';

// ✅ Tipos para melhor type safety
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';

interface ApiRequestOptions {
  endpoint: string;
  method?: HttpMethod;
  body?: any;
  requiresAuth?: boolean;
  showErrorAlert?: boolean;
}

// ✅ Helper para buscar token com error handling
async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('❌ Erro ao buscar token:', error);
    return null;
  }
}

// ✅ Função principal de requisição
export async function apiRequest({
  endpoint,
  method = 'GET',
  body = null,
  requiresAuth = true,
  showErrorAlert = true
}: ApiRequestOptions): Promise<any> {
  try {
    // 1. Preparar headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // 2. Adicionar token se necessário
    if (requiresAuth) {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Preparar options
    const options: RequestInit = {
      method,
      headers,
    };

    // 4. Adicionar body se não for GET
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    // 5. Fazer requisição
    console.log(`🌐 ${method} ${endpoint}`);
    const response = await fetch(`${API_BASE}${endpoint}`, options);

    // 6. Ler resposta como texto primeiro
    const text = await response.text();
    
    if (!text.trim()) {
      throw new Error('Resposta vazia do servidor');
    }

    // 7. Converter para JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', text);
      throw new Error('Resposta inválida do servidor');
    }

    // 8. Verificar erros da API
    if (!response.ok) {
      const errorMessage = data?.erro || `Erro ${response.status}`;
      throw new Error(errorMessage);
    }

    if (data?.erro) {
      throw new Error(data.erro);
    }

    // 9. Sucesso!
    console.log(`✅ ${method} ${endpoint} - Sucesso`);
    return data;

  } catch (error: any) {
    console.error(`❌ Erro em ${endpoint}:`, error);

    // Mostrar alert se configurado
    if (showErrorAlert) {
      const userMessage = error.message || 'Erro desconhecido';
      
      // Mensagens mais amigáveis
      const friendlyMessages: Record<string, string> = {
        'Network request failed': 'Sem conexão com a internet',
        'Token não encontrado': 'Sessão expirada. Faça login novamente.',
        'Resposta vazia do servidor': 'Servidor não respondeu corretamente',
        'The user aborted a request': 'Tempo de resposta excedido'
      };

      Alert.alert(
        'Erro',
        friendlyMessages[userMessage] || userMessage
      );
    }

    throw error;
  }
}

// ✅ Helpers específicos para cada método
export const api = {
  get: (endpoint: string, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'GET', showErrorAlert }),

  post: (endpoint: string, body: any, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'POST', body, showErrorAlert }),

  put: (endpoint: string, body: any, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'PUT', body, showErrorAlert }),

  delete: (endpoint: string, body?: any, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'DELETE', body, showErrorAlert }),

  patch: (endpoint: string, body: any, showErrorAlert = true) =>
    apiRequest({ endpoint, method: 'PATCH', body, showErrorAlert }),

  // ✅ Sem autenticação (login/cadastro)
  noAuth: {
    post: (endpoint: string, body: any, showErrorAlert = true) =>
      apiRequest({ 
        endpoint, 
        method: 'POST', 
        body, 
        requiresAuth: false,
        showErrorAlert 
      })
  }
};

export default api;