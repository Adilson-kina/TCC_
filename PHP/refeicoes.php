<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["POST"]);

$usuario = verificarToken($jwtSecretKey);
$data = json_decode(file_get_contents("php://input"), true);

$tipo = $data["tipo_refeicao"] ?? null;
$sintoma = $data["sintoma"] ?? "nenhum";
$alimentos = $data["alimentos"] ?? [];
$dataRegistro = date("Y-m-d");

if (!$tipo || !is_array($alimentos) || empty($alimentos)) {
    echo json_encode(["erro" => "Campos obrigatórios não preenchidos"]);
    exit();
}

try {
    // 1. Inserir refeição
    $stmt = $pdo->prepare("
        INSERT INTO refeicoes (usuario_id, data_registro, tipo_refeicao, sintoma)
        VALUES (:usuario_id, :data, :tipo, :sintoma)
    ");
    $stmt->bindParam(":usuario_id", $usuario->id);
    $stmt->bindParam(":data", $dataRegistro);
    $stmt->bindParam(":tipo", $tipo);
    $stmt->bindParam(":sintoma", $sintoma);
    $stmt->execute();

    $refeicaoId = $pdo->lastInsertId();

    // 2. Associar alimentos com calorias
    $stmtAlimento = $pdo->prepare("
        INSERT INTO refeicao_alimento (refeicao_id, alimento_id, calorias_por_alimento)
        VALUES (:refeicao_id, :alimento_id, :calorias)
    ");

    foreach ($alimentos as $item) {
        $alimentoId = $item["id"] ?? null;
        $calorias = $item["calorias"] ?? null;

        if ($alimentoId && $calorias !== null) {
            $stmtAlimento->bindParam(":refeicao_id", $refeicaoId);
            $stmtAlimento->bindParam(":alimento_id", $alimentoId);
            $stmtAlimento->bindParam(":calorias", $calorias);
            $stmtAlimento->execute();
        }
    }

    echo json_encode(["mensagem" => "Refeição registrada com sucesso"]);
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro ao registrar refeição: " . $e->getMessage()]);
    exit();
}
?>