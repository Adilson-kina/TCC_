export default async function get(data: any): Promise<any | false> {
  const server = "http://localhost/TCC/PHP/auth.php";
  const params = new URLSearchParams(data);
  const urlWithParams = `${server}?${params.toString()}`;

  try {
    const res = await fetch(urlWithParams, { method: 'GET' });

    if (!res.ok) {
      console.error(`Erro do servidor: Status ${res.status}`);
      return false;
    }

    const text = await res.text(); // Lê a resposta como texto primeiro
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