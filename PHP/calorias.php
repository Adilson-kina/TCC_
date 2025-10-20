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

$passos = max(0, intval($data["passos"] ?? 0));
$dataRegistro = date("Y-m-d");

try {
    // 1. Buscar peso, sexo e nível de atividade do usuário
    $stmt = $pdo->prepare("
        SELECT u.peso, u.sexo_biologico, p.pergunta9_nivel_atividade
        FROM usuarios u
        JOIN perfis p ON u.perfil_id = p.id
        WHERE u.id = :id
    ");
    $stmt->bindParam(":id", $usuario->id);
    $stmt->execute();
    $info = $stmt->fetch(PDO::FETCH_ASSOC);

    $peso = $info["peso"];
    $sexo = $info["sexo_biologico"];
    $nivel = $info["pergunta9_nivel_atividade"];

    // 2. Definir fator de atividade
    $fator = match ($nivel) {
        "baixo" => 0.0004,
        "medio" => 0.0005,
        "alto" => 0.0006,
        default => 0.0005
    };

    // 3. Calcular calorias gastas com base nos passos
    $caloriasGastas = round($passos * $peso * $fator, 2);

    // 4. Calcular calorias ingeridas com base nas refeições do dia
    $stmt = $pdo->prepare("
        SELECT SUM(ra.calorias_por_alimento) AS total_calorias
        FROM refeicoes r
        JOIN refeicao_alimento ra ON r.id = ra.refeicao_id
        WHERE r.usuario_id = :usuario_id AND r.data_registro = :data
    ");
    $stmt->bindParam(":usuario_id", $usuario->id);
    $stmt->bindParam(":data", $dataRegistro);
    $stmt->execute();
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
    $caloriasIngeridas = is_numeric($resultado["total_calorias"]) ? floatval($resultado["total_calorias"]) : 0;

    // 5. Calcular saldo calórico
    $saldoCalorico = $caloriasIngeridas - $caloriasGastas;

    // 6. Estimar gasto calórico diário (peso × 33)
    $estimativaGastoDiario = round($peso * 33, 2);

    // 7. Definir limites mínimos seguros
    $limiteMinimoSeguro = $sexo === "f" ? 1200 : 1500;

    // 8. Definir objetivo de perda de peso (déficit de 500 a 1000 kcal)
    $objetivoMinimo = max($estimativaGastoDiario - 500, $limiteMinimoSeguro);
    $objetivoMaximo = max($estimativaGastoDiario - 1000, $limiteMinimoSeguro);

    // 9. Verifica se já existe registro para hoje
    $stmt = $pdo->prepare("
        SELECT id FROM calorias 
        WHERE usuario_id = :usuario_id AND data_registro = :data
    ");
    $stmt->bindParam(":usuario_id", $usuario->id);
    $stmt->bindParam(":data", $dataRegistro);
    $stmt->execute();
    $existe = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existe) {
        // Atualiza registro existente
        $stmt = $pdo->prepare("
            UPDATE calorias SET 
                passos = :passos,
                calorias_gastas = :gastas,
                calorias_ingeridas = :ingeridas,
                saldo_calorico = :saldo
            WHERE id = :id
        ");
        $stmt->bindParam(":passos", $passos);
        $stmt->bindParam(":gastas", $caloriasGastas);
        $stmt->bindParam(":ingeridas", $caloriasIngeridas);
        $stmt->bindParam(":saldo", $saldoCalorico);
        $stmt->bindParam(":id", $existe["id"]);
        $stmt->execute();
    } else {
        // Insere novo registro
        $stmt = $pdo->prepare("
            INSERT INTO calorias (
                usuario_id, data_registro, passos, calorias_gastas, calorias_ingeridas, saldo_calorico
            ) VALUES (
                :usuario_id, :data, :passos, :gastas, :ingeridas, :saldo
            )
        ");
        $stmt->bindParam(":usuario_id", $usuario->id);
        $stmt->bindParam(":data", $dataRegistro);
        $stmt->bindParam(":passos", $passos);
        $stmt->bindParam(":gastas", $caloriasGastas);
        $stmt->bindParam(":ingeridas", $caloriasIngeridas);
        $stmt->bindParam(":saldo", $saldoCalorico);
        $stmt->execute();
    }

    // 10. Retorno completo
    echo json_encode([
        "mensagem" => "Dados de calorias atualizados com sucesso",
        "peso" => $peso,
        "sexo" => $sexo,
        "nivel_atividade" => $nivel,
        "fator_atividade" => $fator,
        "calorias_ingeridas" => $caloriasIngeridas,
        "calorias_gastas" => $caloriasGastas,
        "saldo_calorico" => $saldoCalorico,
        "estimativa_gasto_diario" => $estimativaGastoDiario,
        "limite_minimo_seguro" => $limiteMinimoSeguro,
        "objetivo_minimo" => $objetivoMinimo,
        "objetivo_maximo" => $objetivoMaximo
    ]);
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro ao registrar calorias: " . $e->getMessage()]);
    exit();
}
?>