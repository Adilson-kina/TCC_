<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET"]);
$usuario = verificarToken($jwtSecretKey);
$dataHoje = date("Y-m-d");

function gerarResumoNutricional($disturbios) {
    if (empty($disturbios)) {
        return [
            "restricoes" => [],
            "recomendados" => []
        ];
    }
    
    $disturbios = mb_strtolower($disturbios, 'UTF-8');
    $resumo = [
        "restricoes" => [],
        "recomendados" => []
    ];

    // ✅ Aceita com ou sem acento
    if (mb_stripos($disturbios, "celiac") !== false) {
        $resumo["restricoes"][] = "Pães, massas, alimentos com glúten (trigo, centeio, cevada)";
        $resumo["recomendados"][] = "Carnes, ovos, azeites, castanhas, queijos e vegetais de baixo carboidrato";
    }
    if (mb_stripos($disturbios, "diabetes") !== false) {
        $resumo["restricoes"][] = "Açúcares, doces, massas refinadas, refrigerantes";
        $resumo["recomendados"][] = "Alimentos com baixo índice glicêmico, ricos em fibras e proteínas magras";
    }
    if (mb_stripos($disturbios, "hipertens") !== false) {
        $resumo["restricoes"][] = "Alimentos ricos em sódio, embutidos, conservas, temperos prontos";
        $resumo["recomendados"][] = "Frutas, vegetais frescos, alimentos naturais com pouco sal";
    }
    if (mb_stripos($disturbios, "hipercolesterol") !== false) {
        $resumo["restricoes"][] = "Frituras, gorduras saturadas, embutidos, queijos gordurosos";
        $resumo["recomendados"][] = "Peixes, azeite de oliva, frutas, legumes e grãos integrais";
    }
    if (mb_stripos($disturbios, "sii") !== false || mb_stripos($disturbios, "intestino") !== false) {
        $resumo["restricoes"][] = "Laticínios, leguminosas, vegetais fermentáveis, adoçantes artificiais";
        $resumo["recomendados"][] = "Carnes magras, arroz, cenoura, abobrinha, alimentos leves e cozidos";
    }

    return $resumo;
}

try {
    // 1. Buscar meta e distúrbios
    $stmtMeta = $pdo->prepare("
        SELECT p.pergunta8_disturbios, m.tipo_meta
        FROM perguntas p
        LEFT JOIN pergunta5_meta m ON m.perguntas_id = p.id
        JOIN usuarios u ON u.perguntas_id = p.id
        WHERE u.id = :usuario_id
    ");
    $stmtMeta->execute([":usuario_id" => $usuario->id]);
    $dadosMeta = $stmtMeta->fetch(PDO::FETCH_ASSOC);

    if (!$dadosMeta) {
        enviarErro(404, "Dados do usuário não encontrados. Complete seu perfil primeiro.");
    }

    $resumo = gerarResumoNutricional($dadosMeta["pergunta8_disturbios"] ?? "");

    // 2. Buscar dados de calorias e passos do dia
    $stmtCalorias = $pdo->prepare("
        SELECT passos, calorias_gastas
        FROM calorias
        WHERE usuario_id = :usuario_id AND data_registro = :data
    ");
    $stmtCalorias->execute([
        ":usuario_id" => $usuario->id,
        ":data" => $dataHoje
    ]);
    $atividade = $stmtCalorias->fetch(PDO::FETCH_ASSOC);
    
    if (!$atividade) {
        $atividade = [
            "passos" => 0,
            "calorias_gastas" => 0
        ];
    }

    // 3. Buscar última refeição
    $stmtUltima = $pdo->prepare("
        SELECT r.id AS refeicao_id, r.tipo_refeicao, r.data_registro
        FROM refeicoes r
        WHERE r.usuario_id = :usuario_id
        ORDER BY r.data_registro DESC, r.id DESC
        LIMIT 1
    ");
    $stmtUltima->execute([":usuario_id" => $usuario->id]);
    $ultimaRefeicao = $stmtUltima->fetch(PDO::FETCH_ASSOC);

    $alimentos = [];
    $totalCalorias = 0;

    if ($ultimaRefeicao) {
        $stmtAlimentos = $pdo->prepare("
            SELECT a.id, a.nome, a.energia_kcal
            FROM refeicoes_alimentos ra
            JOIN alimentos a ON a.id = ra.alimento_id
            WHERE ra.refeicao_id = :refeicao_id
        ");
        $stmtAlimentos->execute([":refeicao_id" => $ultimaRefeicao["refeicao_id"]]);
        $alimentos = $stmtAlimentos->fetchAll(PDO::FETCH_ASSOC);

        foreach ($alimentos as $a) {
            $totalCalorias += floatval($a["energia_kcal"] ?? 0);
        }
    }

    // 4. Montar resposta final
    enviarSucesso(200, [
        "mensagem" => "Dados da tela inicial carregados com sucesso!",
        "dieta" => [
            "meta" => $dadosMeta["tipo_meta"] ?? null,
            "restricoes" => $resumo["restricoes"],
            "recomendados" => $resumo["recomendados"]
        ],
        "atividade" => [
            "passos" => (int)($atividade["passos"] ?? 0),
            "calorias_gastas" => (float)($atividade["calorias_gastas"] ?? 0)
        ],
        "ultima_refeicao" => $ultimaRefeicao ? [
            "tipo" => $ultimaRefeicao["tipo_refeicao"],
            "data" => $ultimaRefeicao["data_registro"],
            "total_calorias" => $totalCalorias,
            "alimentos" => $alimentos
        ] : null
    ]);
} catch (PDOException $e) {
    enviarErro(500, "Erro ao carregar dados da tela inicial: " . $e->getMessage());
} catch (Exception $e) {
    enviarErro(500, "Erro inesperado: " . $e->getMessage());
}
?>