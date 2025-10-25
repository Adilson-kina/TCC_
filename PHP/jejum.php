<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET", "PUT"]);

$usuario = verificarToken($jwtSecretKey);

// =======================
// GET: Verifica se jejum está ativo
// =======================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->prepare("
            SELECT u.jejum_ativo, p.pergunta3_jejum_intermitente
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            WHERE u.id = :id
        ");
        $stmt->execute([":id" => $usuario->id]);
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            echo json_encode(["erro" => "Usuário não encontrado"]);
            exit();
        }

        // Lógica de ativação do jejum
        $jejumAtivo = match (true) {
            $dados["jejum_ativo"] === null => $dados["pergunta3_jejum_intermitente"] === "sim",
            default => boolval($dados["jejum_ativo"])
        };

        echo json_encode([
            "usuario_id" => $usuario->id,
            "jejum_ativo" => $jejumAtivo
        ]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao verificar jejum: " . $e->getMessage()]);
        exit();
    }
}

// =======================
// PUT: Atualiza jejum manualmente
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);
    $ativar = isset($data["jejum_ativo"]) ? (int) $data["jejum_ativo"] : null;

    if (!in_array($ativar, [0, 1], true)) {
        echo json_encode(["erro" => "Valor inválido para jejum_ativo"]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET jejum_ativo = :ativo WHERE id = :id");
        $stmt->execute([
            ":ativo" => $ativar,
            ":id" => $usuario->id
        ]);

        // 🆕 Buscar dados atualizados
        $stmtGet = $pdo->prepare("
            SELECT u.jejum_ativo, p.pergunta3_jejum_intermitente, u.nome
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            WHERE u.id = :id
        ");
        $stmtGet->execute([":id" => $usuario->id]);
        $dados = $stmtGet->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "mensagem" => "Jejum " . ($ativar ? "ativado" : "desativado") . " com sucesso",
            "usuario" => $dados["nome"],
            "jejum_ativo" => boolval($dados["jejum_ativo"]),
        ]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao atualizar jejum: " . $e->getMessage()]);
        exit();
    }
}
?>