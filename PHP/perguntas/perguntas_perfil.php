<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');
permitirMetodos(["GET", "POST"]);

$usuario = verificarToken($jwtSecretKey);

// =======================
// GET: retorna peso recomendado para exibir na tela 
// =======================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->prepare("
            SELECT peso_inicial, altura, data_nascimento, imc_inicial
            FROM usuarios
            WHERE id = :id
        ");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            echo json_encode(["erro" => "Usuário não encontrado"]);
            exit();
        }

        $peso = floatval($dados["peso_inicial"]);
        $alturaCm = floatval($dados["altura"]);
        $alturaM = $alturaCm / 100;
        $imc = floatval($dados["imc_inicial"]);

        $nascimento = new DateTime($dados["data_nascimento"]);
        $hoje = new DateTime();
        $idade = $hoje->diff($nascimento)->y;

        $imcMin = 18.5;
        $imcMax = 24.9;
        $pesoMin = round($imcMin * ($alturaM * $alturaM), 1);
        $pesoMax = round($imcMax * ($alturaM * $alturaM), 1);

        echo json_encode([
            "peso_atual" => $peso,
            "idade" => $idade,
            "altura" => $alturaM,
            "imc_atual" => $imc,
            "peso_recomendado_min" => $pesoMin,
            "peso_recomendado_max" => $pesoMax
        ]);
        exit();
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao consultar dados: " . $e->getMessage()]);
        exit();
    }
}

// =======================
// POST: salva respostas do perfil no banco de dados
// =======================
$data = json_decode(file_get_contents("php://input"), true);

// Salva distúrbios numa única string ("compulsão, ansiedade alimentar, bulimia")

// =======================
// DOENÇAS DISPONÍVEIS: 
// =======================
$disturbiosStr = implode(", ", $data["disturbios"] ?? []);

try {
    $stmt = $pdo->prepare("
        INSERT INTO perguntas (
            pergunta1_objetivo,
            pergunta2_contagem_calorica,
            pergunta3_jejum_intermitente,
            pergunta4_nivel_atividade,
            pergunta6_tipo_dieta,
            pergunta7_comer_fds,
            pergunta8_disturbios,
            pergunta9_possui_dieta
        ) VALUES (
            :objetivo,
            :contagem_calorica,
            :jejum_intermitente,
            :nivel_atividade,
            :tipo_dieta,
            :comer_fds,
            :disturbios,
            :possui_dieta
        )
    ");

    $stmt->execute([
        ":objetivo" => $data["objetivo"],
        ":contagem_calorica" => $data["contagem_calorica"],
        ":jejum_intermitente" => $data["jejum_intermitente"],
        ":nivel_atividade" => $data["nivel_atividade"],
        ":tipo_dieta" => $data["tipo_dieta"],
        ":comer_fds" => $data["comer_fds"],
        ":disturbios" => $disturbiosStr,
        ":possui_dieta" => $data["possui_dieta"]
    ]);

    $perguntasId = $pdo->lastInsertId();
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro ao salvar respostas: " . $e->getMessage()]);
    exit();
}

// =======================
// POST: salva dados da pergunta 5
// =======================
$tipoMeta = $data["objetivo"] ?? null;
$valorDesejado = $data["valor_desejado"] ?? null;
$faixaRecomendada = $data["faixa_recomendada"] ?? null;

try {
    $stmtMeta = $pdo->prepare("
    INSERT INTO pergunta5_meta (
        perguntas_id,
        tipo_meta,
        valor_desejado,
        faixa_recomendada
    ) VALUES (
        :perguntas_id,
        :tipo_meta,
        :valor_desejado,
        :faixa
    )");

    $stmtMeta->execute([
        ":perguntas_id" => $perguntasId,
        ":tipo_meta" => $tipoMeta,
        ":valor_desejado" => $valorDesejado,
        ":faixa" => $faixaRecomendada
    ]);

    $metaId = $pdo->lastInsertId();
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro ao salvar meta desejada: " . $e->getMessage()]);
    exit();
}

// =======================
// POST: atualiza usuário com o ID das perguntas
// =======================
try {
    $stmt = $pdo->prepare("
        UPDATE usuarios 
        SET perguntas_id = :perguntas_id
        WHERE id = :id
    ");

    $stmt->bindParam(":perguntas_id", $perguntasId);
    $stmt->bindParam(":id", $usuario->id);
    $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro ao atualizar usuário: " . $e->getMessage()]);
    exit();
}

echo json_encode([
    "mensagem" => "Respostas salvas com sucesso!",
    "perguntas_id" => $perguntasId,
    "meta_id" => $metaId
]);
?>