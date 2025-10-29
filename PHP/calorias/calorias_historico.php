
<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// 👇 CORRIJA ESTA LINHA - deve ter '..' para subir uma pasta
require_once(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET"]);

$usuario = verificarToken($jwtSecretKey);

try {
    // Busca os últimos 7 dias de registros
    $stmt = $pdo->prepare("
        SELECT data_registro, passos, calorias_gastas, calorias_ingeridas, saldo_calorico
        FROM calorias
        WHERE usuario_id = :usuario_id
        ORDER BY data_registro DESC
        LIMIT 7
    ");
    $stmt->bindParam(":usuario_id", $usuario->id);
    $stmt->execute();
    $historico = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Inverte para ordem cronológica
    $historico = array_reverse($historico);

    // ✅ CORREÇÃO: Retorna dentro de um objeto com chave "dados"
    enviarSucesso(200, [
        "mensagem" => "Histórico carregado com sucesso!",
        "dados" => $historico
    ]);
} catch (PDOException $e) {
    enviarErro(500, "Erro ao buscar histórico: " . $e->getMessage());
}
?>