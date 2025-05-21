export default async function post(data, endpoint) {
  const server = `http://localhost/TCC/server.php?endpoint=${endpoint}`;

  try {
    const res = await fetch(server, {
      method: endpoint === "delete" ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error(`Erro do servidor: Status ${res.status}`);
      return { erro: `Erro do servidor (${res.status})` };
    }

    const text = await res.text(); // Lê a resposta como texto primeiro
    if (!text.trim()) {
      console.error("Resposta do servidor vazia.");
      return { erro: "Resposta do servidor vazia" };
    }

    try {
      return JSON.parse(text); // Tenta converter para JSON
    } catch (err) {
      console.error("Erro ao converter resposta para JSON:", text);
      return { erro: "Resposta inválida do servidor" };
    }
  } catch (err) {
    console.error("Erro na requisição:", err.message);
    return { erro: "Erro na requisição" };
  }
}
