<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

$usuario = verificarToken($jwtSecretKey);

function gerarResumoNutricional($disturbios) {
    $disturbios = strtolower($disturbios);
    $resumo = [
        "restricoes" => [],
        "recomendados" => []
    ];

    if (str_contains($disturbios, "celíaca")) {
        $resumo["restricoes"][] = "Pães, massas, alimentos com glúten (trigo, centeio, cevada)";
        $resumo["recomendados"][] = "Carnes, ovos, azeites, castanhas, queijos e vegetais de baixo carboidrato";
    }
    if (str_contains($disturbios, "diabetes")) {
        $resumo["restricoes"][] = "Açúcares, doces, massas refinadas, refrigerantes";
        $resumo["recomendados"][] = "Alimentos com baixo índice glicêmico, ricos em fibras e proteínas magras";
    }
    if (str_contains($disturbios, "hipertensão")) {
        $resumo["restricoes"][] = "Alimentos ricos em sódio, embutidos, conservas, temperos prontos";
        $resumo["recomendados"][] = "Frutas, vegetais frescos, alimentos naturais com pouco sal";
    }
    if (str_contains($disturbios, "hipercolesterolemia")) {
        $resumo["restricoes"][] = "Frituras, gorduras saturadas, embutidos, queijos gordurosos";
        $resumo["recomendados"][] = "Peixes, azeite de oliva, frutas, legumes e grãos integrais";
    }
    if (str_contains($disturbios, "sii")) {
        $resumo["restricoes"][] = "Laticínios, leguminosas, vegetais fermentáveis, adoçantes artificiais";
        $resumo["recomendados"][] = "Carnes magras, arroz, cenoura, abobrinha, alimentos leves e cozidos";
    }

    return $resumo;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        // 1. Buscar doenças e meta do usuário
        $stmt = $pdo->prepare("
            SELECT p.pergunta8_disturbios, m.tipo_meta
            FROM perguntas p
            JOIN pergunta5_meta m ON m.perguntas_id = p.id
            JOIN usuarios u ON u.perguntas_id = p.id
            WHERE u.id = :usuario_id
        ");
        $stmt->execute([":usuario_id" => $usuario->id]);
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            echo json_encode(["erro" => "Dados de dieta não encontrados para este usuário"]);
            exit();
        }

        // 2. Gerar resumo nutricional
        $resumo = gerarResumoNutricional($dados["pergunta8_disturbios"]);

        // 3. Buscar alimentos permitidos
        $stmtAlimentos = $pdo->prepare("
            SELECT a.id, a.nome, a.categoria, a.energia_kcal, a.carboidrato_g, a.proteina_g
            FROM alimentos a
            JOIN alimentos_permitidos ap ON ap.alimento_id = a.id
            WHERE ap.usuario_id = :usuario_id
            ORDER BY a.nome ASC
        ");
        $stmtAlimentos->execute([":usuario_id" => $usuario->id]);
        $alimentosPermitidos = $stmtAlimentos->fetchAll(PDO::FETCH_ASSOC);

        // 4. Retornar tudo
        echo json_encode([
            "disturbios" => $dados["pergunta8_disturbios"],
            "meta" => [
                "tipo" => $dados["tipo_meta"],
            ],
            "restricoes" => $resumo["restricoes"],
            "recomendados" => $resumo["recomendados"],
            "alimentos_permitidos" => $alimentosPermitidos
        ]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao buscar dados da dieta: " . $e->getMessage()]);
        exit();
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $alimentosSelecionados = $data["alimentos"];

    if (!is_array($alimentosSelecionados)) {
        echo json_encode(["erro" => "Formato inválido de alimentos"]);
        exit();
    }

    try {
        // 1. Validar se os alimentos estão em alimentos_permitidos
        $placeholders = implode(',', array_fill(0, count($alimentosSelecionados), '?'));
        $stmtValidar = $pdo->prepare("
            SELECT alimento_id FROM alimentos_permitidos
            WHERE usuario_id = ? AND alimento_id IN ($placeholders)
        ");
        $stmtValidar->execute(array_merge([$usuario->id], $alimentosSelecionados));
        $permitidos = $stmtValidar->fetchAll(PDO::FETCH_COLUMN);

        if (count($permitidos) !== count($alimentosSelecionados)) {
            echo json_encode(["erro" => "Alguns alimentos não são permitidos para este usuário"]);
            exit();
        }

        // 2. Apagar dieta atual
        $stmtDelete = $pdo->prepare("DELETE FROM dieta WHERE usuario_id = :usuario_id");
        $stmtDelete->execute([":usuario_id" => $usuario->id]);

        // 3. Inserir nova dieta
        $stmtInsert = $pdo->prepare("
            INSERT INTO dieta (usuario_id, alimento_id)
            VALUES (:usuario_id, :alimento_id)
        ");
        foreach ($alimentosSelecionados as $idAlimento) {
            $stmtInsert->execute([
                ":usuario_id" => $usuario->id,
                ":alimento_id" => $idAlimento
            ]);
        }

        echo json_encode(["sucesso" => true, "mensagem" => "Dieta atualizada com sucesso"]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao salvar dieta: " . $e->getMessage()]);
        exit();
    }
}
?>