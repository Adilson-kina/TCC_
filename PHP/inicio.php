<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

$usuario = verificarToken($jwtSecretKey);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
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

        if (mb_stripos($disturbios, "celiac") !== false) {
            $resumo["restricoes"][] = "Pães, massas, alimentos com glúten";
            $resumo["recomendados"][] = "Carnes, ovos, azeites, castanhas";
        }
        if (mb_stripos($disturbios, "diabetes") !== false) {
            $resumo["restricoes"][] = "Açúcares, doces, massas refinadas";
            $resumo["recomendados"][] = "Alimentos com baixo índice glicêmico";
        }
        if (mb_stripos($disturbios, "hipertens") !== false) {
            $resumo["restricoes"][] = "Alimentos ricos em sódio, embutidos";
            $resumo["recomendados"][] = "Frutas, vegetais frescos";
        }
        if (mb_stripos($disturbios, "hipercolesterol") !== false) {
            $resumo["restricoes"][] = "Frituras, gorduras saturadas";
            $resumo["recomendados"][] = "Peixes, azeite de oliva, frutas";
        }
        if (mb_stripos($disturbios, "sii") !== false) {
            $resumo["restricoes"][] = "Laticínios, leguminosas";
            $resumo["recomendados"][] = "Carnes magras, arroz, cenoura";
        }

        return $resumo;
    }

    try {
        // 1. Buscar meta do usuário
        $stmtMeta = $pdo->prepare("
            SELECT m.tipo_meta, u.ordenacao_home
            FROM pergunta5_meta m
            JOIN perguntas p ON m.perguntas_id = p.id
            JOIN usuarios u ON u.perguntas_id = p.id
            WHERE u.id = :usuario_id
        ");
        $stmtMeta->execute([":usuario_id" => $usuario->id]);
        $dadosMeta = $stmtMeta->fetch(PDO::FETCH_ASSOC);

        if (!$dadosMeta) {
            enviarErro(404, "Meta não encontrada para este usuário.");
        }

        // 1.5. Buscar distúrbios para gerar resumo nutricional
        $stmtDisturbios = $pdo->prepare("
            SELECT p.pergunta8_disturbios
            FROM perguntas p
            JOIN usuarios u ON u.perguntas_id = p.id
            WHERE u.id = :usuario_id
        ");
        $stmtDisturbios->execute([":usuario_id" => $usuario->id]);
        $dadosDisturbios = $stmtDisturbios->fetch(PDO::FETCH_ASSOC);

        $resumo = gerarResumoNutricional($dadosDisturbios["pergunta8_disturbios"] ?? "");

        $ordenacaoHome = $dadosMeta['ordenacao_home'] ?? 'carboidrato_g';

        // 2. Buscar top 5 alimentos da dieta ordenados pela preferência do usuário
        $stmtTopAlimentos = $pdo->prepare("
            SELECT a.nome, a.energia_kcal, a.carboidrato_g, a.proteina_g, a.lipideos_g
            FROM alimentos a
            JOIN dieta d ON d.alimento_id = a.id
            WHERE d.usuario_id = :usuario_id
            ORDER BY CAST(a.$ordenacaoHome AS DECIMAL(10,2)) DESC
            LIMIT 5
        ");
        $stmtTopAlimentos->execute([":usuario_id" => $usuario->id]);
        $topAlimentos = $stmtTopAlimentos->fetchAll(PDO::FETCH_ASSOC);

        // Formatar os top alimentos com valor e unidade
        $topAlimentosFormatados = [];
        foreach ($topAlimentos as $alimento) {
            $valor = '';
            $unidade = '';
            
            switch ($ordenacaoHome) {
                case 'carboidrato_g':
                    $valor = $alimento['carboidrato_g'];
                    $unidade = 'g carb';
                    break;
                case 'proteina_g':
                    $valor = $alimento['proteina_g'];
                    $unidade = 'g prot';
                    break;
                case 'energia_kcal':
                    $valor = $alimento['energia_kcal'];
                    $unidade = 'kcal';
                    break;
                case 'lipideos_g':
                    $valor = $alimento['lipideos_g'];
                    $unidade = 'g gord';
                    break;
            }

            $topAlimentosFormatados[] = [
                'nome' => $alimento['nome'],
                'valor' => $valor,
                'unidade' => $unidade
            ];
        }

        // 3. Buscar dados de atividade (passos e calorias gastas de hoje)
        $stmtAtividade = $pdo->prepare("
            SELECT passos, calorias_gastas
            FROM calorias
            WHERE usuario_id = :usuario_id AND data_registro = CURDATE()
        ");
        $stmtAtividade->execute([":usuario_id" => $usuario->id]);
        $atividade = $stmtAtividade->fetch(PDO::FETCH_ASSOC);

        // 4. Buscar calorias ingeridas de hoje
        $stmt = $pdo->prepare("
            SELECT 
                COALESCE(SUM(CAST(a.energia_kcal AS DECIMAL(10,2))), 0) as calorias_ingeridas
            FROM refeicoes r
            JOIN refeicoes_alimentos ra ON r.id = ra.refeicao_id
            JOIN alimentos a ON a.id = ra.alimento_id
            WHERE r.usuario_id = :usuario_id 
            AND DATE(r.data_registro) = CURDATE()
        ");
        $stmt->bindParam(":usuario_id", $usuario->id);
        $stmt->execute();
        $resultCalorias = $stmt->fetch(PDO::FETCH_ASSOC);
        $caloriasIngeridas = floatval($resultCalorias["calorias_ingeridas"]);

        // 5. Buscar última refeição
        $stmtUltimaRefeicao = $pdo->prepare("
            SELECT r.id, r.tipo_refeicao, r.data_registro, r.sintoma
            FROM refeicoes r
            WHERE r.usuario_id = :usuario_id
            ORDER BY r.data_registro DESC, r.id DESC
            LIMIT 1
        ");
        $stmtUltimaRefeicao->execute([":usuario_id" => $usuario->id]);
        $ultimaRefeicao = $stmtUltimaRefeicao->fetch(PDO::FETCH_ASSOC);

        // 🆕 6. ADICIONAR ISTO AQUI - Buscar total de refeições de HOJE
        $dataHoje = date("Y-m-d");
        $stmtHoje = $pdo->prepare("
            SELECT 
                COUNT(DISTINCT r.id) as total_refeicoes,
                SUM(CAST(a.energia_kcal AS DECIMAL(6,2))) as calorias_total
            FROM refeicoes r
            JOIN refeicoes_alimentos ra ON r.id = ra.refeicao_id
            JOIN alimentos a ON a.id = ra.alimento_id
            WHERE r.usuario_id = :usuario_id 
            AND r.data_registro = :data
        ");
        $stmtHoje->execute([
            ":usuario_id" => $usuario->id,
            ":data" => $dataHoje
        ]);
        $refeicoesHoje = $stmtHoje->fetch(PDO::FETCH_ASSOC);

        // 🆕 5. Sugerir próxima refeição (respeita sequência, mas ajusta se horário avançou demais)
        $proximaRefeicao = 'Café da Manhã'; // padrão
        $horaAtual = (int)date('H');

        // Definir qual refeição corresponde a cada horário
        function refeicaoPorHorario($hora) {
            return match(true) {
                $hora >= 6 && $hora < 11 => 'Café da Manhã',
                $hora >= 11 && $hora < 15 => 'Almoço',
                $hora >= 15 && $hora < 19 => 'Lanche',
                default => 'Jantar' // 19h em diante ou madrugada
            };
        }

        // Ordem das refeições para comparação
        $ordemRefeicoes = ['Café da Manhã' => 1, 'Almoço' => 2, 'Lanche' => 3, 'Jantar' => 4];

        if ($ultimaRefeicao) {
            // Próxima refeição lógica baseada na última
            $proximaLogica = match($ultimaRefeicao['tipo_refeicao']) {
                'cafe' => 'Almoço',
                'almoco' => 'Lanche',
                'lanche' => 'Jantar',
                'janta' => 'Café da Manhã',
                default => 'Café da Manhã'
            };
            
            // Refeição que deveria estar acontecendo agora baseado no horário
            $refeicaoDoHorario = refeicaoPorHorario($horaAtual);
            
            // Se a refeição do horário está "mais à frente" na sequência que a próxima lógica, usa ela
            if ($ordemRefeicoes[$refeicaoDoHorario] > $ordemRefeicoes[$proximaLogica]) {
                $proximaRefeicao = $refeicaoDoHorario;
            } else {
                $proximaRefeicao = $proximaLogica;
            }
        } else {
            // Se não há refeição registrada, sugere baseado no horário
            $proximaRefeicao = refeicaoPorHorario($horaAtual);
        }

        $ultimaRefeicaoData = null;
        if ($ultimaRefeicao) {
            // Buscar alimentos da última refeição
            $stmtAlimentosRefeicao = $pdo->prepare("
                SELECT a.id, a.nome, a.energia_kcal
                FROM alimentos a
                JOIN refeicoes_alimentos ra ON ra.alimento_id = a.id
                WHERE ra.refeicao_id = :refeicao_id
            ");
            $stmtAlimentosRefeicao->execute([":refeicao_id" => $ultimaRefeicao['id']]);
            $alimentosRefeicao = $stmtAlimentosRefeicao->fetchAll(PDO::FETCH_ASSOC);

            // Calcular total de calorias
            $totalCalorias = 0;
            foreach ($alimentosRefeicao as $alimento) {
                $totalCalorias += floatval($alimento['energia_kcal']);
            }

            $ultimaRefeicaoData = [
                'tipo' => $ultimaRefeicao['tipo_refeicao'],
                'data' => $ultimaRefeicao['data_registro'],
                'sintoma' => $ultimaRefeicao['sintoma'],
                'alimentos' => $alimentosRefeicao,
                'total_calorias' => $totalCalorias
            ];
        }

        // 7. Buscar últimos 5 registros de peso para o gráfico
        $stmtProgresso = $pdo->prepare("
            SELECT peso, data_registro, DATE_FORMAT(data_registro, '%d/%m') as data_formatada
            FROM historico_peso
            WHERE usuario_id = :usuario_id
            ORDER BY data_registro DESC
            LIMIT 5
        ");
        $stmtProgresso->execute([":usuario_id" => $usuario->id]);
        $historicoProgresso = $stmtProgresso->fetchAll(PDO::FETCH_ASSOC);

        // Inverter ordem para mostrar do mais antigo ao mais recente
        $historicoProgresso = array_reverse($historicoProgresso);

        // 8. Montar resposta final
        enviarSucesso(200, [
            "mensagem" => "Dados da tela inicial carregados com sucesso!",
            "dieta" => [
                "meta" => $dadosMeta["tipo_meta"] ?? null,
                "top_alimentos" => $topAlimentosFormatados,
                "restricoes" => $resumo["restricoes"],
                "recomendados" => $resumo["recomendados"]
            ],
            "atividade" => [
                "passos" => (int)($atividade["passos"] ?? 0),
                "calorias_gastas" => (float)($atividade["calorias_gastas"] ?? 0),
                "calorias_ingeridas" => $caloriasIngeridas,
                "saldo_calorico" => $caloriasIngeridas - (float)($atividade["calorias_gastas"] ?? 0)
            ],
            "refeicoes_hoje" => [
                "total" => (int)($refeicoesHoje["total_refeicoes"] ?? 0),
                "calorias_total" => (float)($refeicoesHoje["calorias_total"] ?? 0)
            ],
            "proxima_refeicao" => $proximaRefeicao,
            "ultima_refeicao" => $ultimaRefeicaoData,
            "progresso" => $historicoProgresso
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao buscar dados da tela inicial: " . $e->getMessage());
    }
}
?>