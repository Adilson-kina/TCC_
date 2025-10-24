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
    // 1. Validar se todos os alimentos estão na dieta do usuário
    $alimentoIds = array_column($alimentos, "id");
    $placeholders = implode(',', array_fill(0, count($alimentoIds), '?'));

    $stmtValidar = $pdo->prepare("
        SELECT alimento_id FROM dieta
        WHERE usuario_id = ? AND alimento_id IN ($placeholders)
    ");
    $stmtValidar->execute(array_merge([$usuario->id], $alimentoIds));
    $permitidos = $stmtValidar->fetchAll(PDO::FETCH_COLUMN);

    if (count($permitidos) !== count($alimentoIds)) {
        echo json_encode(["erro" => "Alguns alimentos não fazem parte da dieta do usuário"]);
        exit();
    }

    // 2. Inserir refeição
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

    // 3. Associar alimentos com calorias
    $stmtAlimento = $pdo->prepare("
        INSERT INTO refeicoes_alimentos (refeicao_id, alimento_id)
        VALUES (:refeicao_id, :alimento_id)
    ");

    foreach ($alimentos as $item) {
        $alimentoId = $item["id"] ?? null;
        
        if ($alimentoId) {
            $stmtAlimento->bindParam(":refeicao_id", $refeicaoId);
            $stmtAlimento->bindParam(":alimento_id", $alimentoId);
            $stmtAlimento->execute();
        }
    }

    echo json_encode(["mensagem" => "Refeição registrada com sucesso"]);
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro ao registrar refeição: " . $e->getMessage()]);
    exit();
}
?>