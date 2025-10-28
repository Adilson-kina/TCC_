export default async function get(data: any): Promise<any | false> {
  const server = "https://dietase.xo.je/TCC/PHP/auth.php";
  const params = new URLSearchParams(data);
  const urlWithParams = `${server}?${params.toString()}`;

  try {
    const res = await fetch(urlWithParams, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // 🆕 ADICIONAR timeout
      signal: AbortSignal.timeout(10000) // 10 segundos
    });

    if (!res.ok) {
      console.error(`Erro do servidor: Status ${res.status}`);
      const errorText = await res.text();
      console.error('Resposta de erro:', errorText);
      return false;
    }

    const text = await res.text();
    console.log('Resposta bruta:', text); // 🆕 DEBUG
    
    if (!text.trim()) {
      console.error("Resposta do servidor vazia.");
      return false;
    }

    try {
      const result = JSON.parse(text);
      console.log("Server response:", result);

      if (result && result.erro) {
        console.error("Erro do servidor:", result.erro);
        return false;
      }

      return result; 
    } catch (err) {
      console.error("Erro ao converter resposta para JSON:", text);
      return false;
    }
  } catch (err) {
    console.error(`Erro na requisição: ${err}`);
    return false;
  }
}