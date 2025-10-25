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
            enviarErro(404, "Dados de dieta não encontrados para este usuário.");
        }

        // 2. Gerar resumo nutricional
        $resumo = gerarResumoNutricional($dados["pergunta8_disturbios"]);

        // 3. Buscar alimentos permitidos (todos os que o filtro liberou)
        $stmtPermitidos = $pdo->prepare("
            SELECT a.id, a.nome, a.categoria, a.energia_kcal, a.carboidrato_g, a.proteina_g
            FROM alimentos a
            JOIN alimentos_permitidos ap ON ap.alimento_id = a.id
            WHERE ap.usuario_id = :usuario_id
            ORDER BY a.nome ASC
        ");
        $stmtPermitidos->execute([":usuario_id" => $usuario->id]);
        $alimentosPermitidos = $stmtPermitidos->fetchAll(PDO::FETCH_ASSOC);

        // 🆕 4. Buscar dieta salva (os que o usuário escolheu)
        $stmtDieta = $pdo->prepare("
            SELECT a.id, a.nome, a.categoria, a.energia_kcal, a.carboidrato_g, a.proteina_g
            FROM alimentos a
            JOIN dieta d ON d.alimento_id = a.id
            WHERE d.usuario_id = :usuario_id
            ORDER BY a.nome ASC
        ");
        $stmtDieta->execute([":usuario_id" => $usuario->id]);
        $dietaSalva = $stmtDieta->fetchAll(PDO::FETCH_ASSOC);

        // 5. Retornar tudo
        enviarSucesso(200, [
            "mensagem" => "Valores retornados com sucesso!",
            "disturbios" => $dados["pergunta8_disturbios"],
            "meta" => [
                "tipo" => $dados["tipo_meta"],
            ],
            "restricoes" => $resumo["restricoes"],
            "recomendados" => $resumo["recomendados"],
            "alimentos_permitidos" => $alimentosPermitidos,
            "dieta_salva" => $dietaSalva 
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao buscar dados da dieta: " . $e->getMessage());
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $alimentosSelecionados = $data["alimentos"];

    if (!is_array($alimentosSelecionados)) {
        enviarErro(400, "Formato inválido de alimentos.");
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
            enviarErro(403, "Alguns alimentos não são permitidos para este usuário.");
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

        // 🆕 4. Buscar a dieta atualizada com detalhes dos alimentos
        $stmtDieta = $pdo->prepare("
            SELECT a.id, a.nome, a.categoria, a.energia_kcal, a.carboidrato_g, a.proteina_g, a.lipideos_g
            FROM alimentos a
            JOIN dieta d ON d.alimento_id = a.id
            WHERE d.usuario_id = :usuario_id
            ORDER BY a.nome ASC
        ");
        $stmtDieta->execute([":usuario_id" => $usuario->id]);
        $dietaAtualizada = $stmtDieta->fetchAll(PDO::FETCH_ASSOC);

        enviarSucesso(201, [
            "mensagem" => "Dieta atualizada com sucesso!",
            "total_alimentos" => count($dietaAtualizada),
            "dieta_atualizada" => $dietaAtualizada
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao salvar dieta: " . $e->getMessage());
    }
}
?>