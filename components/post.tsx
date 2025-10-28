export default async function post(data, endpoint) {
  const server = `https://dietase.xo.je/TCC/PHP/auth.php?endpoint=${endpoint}`;

  try {
    const res = await fetch(server, {
      method: endpoint === "delete" ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    const text = await res.text(); // Lê a resposta como texto primeiro
    
    if (!text.trim()) {
      console.error("Resposta do servidor vazia.");
      return { erro: "Resposta do servidor vazia" };
    }

    try {
      const json = JSON.parse(text); // Tenta converter para JSON
      
      // ✅ MUDANÇA AQUI: Retorna o JSON mesmo se não for ok (para pegar a mensagem de erro)
      return json;
      
    } catch (err) {
      console.error("Erro ao converter resposta para JSON:", text);
      return { erro: "Resposta inválida do servidor" };
    }
  } catch (err) {
    console.error("Erro na requisição:", err.message);
    return { erro: "Erro de conexão com o servidor" };
  }
}