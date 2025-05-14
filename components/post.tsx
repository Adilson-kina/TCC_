export default async function post(data) {
  const server = "http://localhost/TCC/server.php";

  try {
    const res = await fetch(server, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error(`Erro do servidor: Status ${res.status}`);
      return false;
    }

    const result = await res.json(); // Converte a resposta para JSON

    if (!result || result.erro) {
      console.error("Erro do servidor:", result.erro ?? "Resposta inesperada");
      return false;
    }

    console.log("Server response:", result);
    
    return result; // Retorna a resposta completa para capturar o ID
  } catch (err) {
    console.error("Erro na requisição:", err.message);
    return false;
  }
}
