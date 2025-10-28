<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, PATCH OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET", "PUT", "PATCH"]);

$usuario = verificarToken($jwtSecretKey);

// =======================
// GET: Buscar dados do perfil
// =======================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                m.tipo_meta AS meta,
                m.valor_desejado,
                m.faixa_recomendada,
                u.peso_inicial,
                u.imc_inicial,
                u.peso AS peso_atual,
                u.imc AS imc_atual,
                u.altura,
                u.total_registros_peso,
                (SELECT MAX(data_registro) FROM historico_peso WHERE usuario_id = u.id) as ultima_atualizacao
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            JOIN pergunta5_meta m ON m.perguntas_id = p.id
            WHERE u.id = :id
        ");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            enviarErro(404, "Perfil não encontrado");
        }

        // Buscar histórico de peso
        $stmtHistorico = $pdo->prepare("
            SELECT peso, DATE_FORMAT(data_registro, '%d/%m') as data_formatada
            FROM historico_peso
            WHERE usuario_id = :usuario_id
            ORDER BY data_registro ASC
            LIMIT 20
        ");
        $stmtHistorico->bindParam(":usuario_id", $usuario->id);
        $stmtHistorico->execute();
        $historico = $stmtHistorico->fetchAll(PDO::FETCH_ASSOC);

        // Se não houver histórico mas tiver peso inicial e atual, criar pontos
        if (empty($historico) && $dados['peso_inicial'] > 0 && $dados['peso_atual'] > 0) {
            $historico = [
                ['peso' => $dados['peso_inicial'], 'data_formatada' => 'Início'],
                ['peso' => $dados['peso_atual'], 'data_formatada' => 'Atual']
            ];
        }

        // Calcular se bateu a meta
        $bateu_meta = false;
        $valor_desejado = $dados['valor_desejado'];
        $peso_atual = $dados['peso_atual'];
        $meta = $dados['meta'];

        if ($valor_desejado && $peso_atual > 0) {
            if ($meta === 'perder' && $peso_atual <= $valor_desejado) {
                $bateu_meta = true;
            } elseif ($meta === 'ganhar' && $peso_atual >= $valor_desejado) {
                $bateu_meta = true;
            } elseif ($meta === 'manter' && abs($peso_atual - $valor_desejado) <= 1) {
                $bateu_meta = true;
            }
        }

        enviarSucesso(200, [
            "mensagem" => "Dados de progresso carregados com sucesso!",
            "meta" => $dados["meta"],
            "peso_inicial" => $dados["peso_inicial"],
            "imc_inicial" => $dados["imc_inicial"],
            "peso_atual" => $dados["peso_atual"],
            "imc_atual" => $dados["imc_atual"],
            "altura" => $dados["altura"],
            "historico" => $historico,
            "valor_desejado" => $dados["valor_desejado"],
            "bateu_meta" => $bateu_meta,
            "total_registros_peso" => (int)$dados["total_registros_peso"],
            "ultima_atualizacao" => $dados["ultima_atualizacao"] // 🆕 ADICIONADO
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao buscar dados: " . $e->getMessage());
    }
}

// =======================
// PUT: Atualizar progresso (peso e IMC)
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["peso"]) || $data["peso"] <= 0) {
        enviarErro(400, "Peso inválido. Não é permitido registrar peso igual a 0.");
    }

    try {
        $peso = $data["peso"];

        // Buscar altura e último registro de peso
        $stmt = $pdo->prepare("
            SELECT altura, peso, 
                   (SELECT MAX(data_registro) FROM historico_peso WHERE usuario_id = :id) as ultima_data
            FROM usuarios 
            WHERE id = :id
        ");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();
        $dadosUsuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dadosUsuario['altura']) {
            enviarErro(404, "Altura não encontrada para o usuário.");
        }

        // Verificar se última atualização foi há menos de 7 dias
        if ($dadosUsuario['ultima_data']) {
            $ultimaData = new DateTime($dadosUsuario['ultima_data']);
            $hoje = new DateTime();
            $diferenca = $hoje->diff($ultimaData)->days;

            if ($diferenca < 7) {
                $diasRestantes = 7 - $diferenca;
                enviarErro(400, "Você só pode atualizar seu peso uma vez por semana. Faltam {$diasRestantes} dia(s).");
            }
        }

        // Se já tem peso registrado e está tentando colocar 0
        if ($dadosUsuario['peso'] > 0 && $peso == 0) {
            enviarErro(400, "Não é permitido registrar peso igual a 0 após já ter registrado um peso.");
        }

        $alturaCm = $dadosUsuario['altura'];
        $alturaM = $alturaCm / 100;
        $imc = ($alturaM > 0) ? $peso / ($alturaM * $alturaM) : null;

        // Atualiza peso, IMC e incrementa contador
        $stmt = $pdo->prepare("
            UPDATE usuarios
            SET peso = :peso,
                imc = :imc,
                total_registros_peso = total_registros_peso + 1
            WHERE id = :id
        ");
        $stmt->bindParam(":peso", $peso);
        $stmt->bindParam(":imc", $imc);
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();

        // Registrar no histórico
        $stmtHistorico = $pdo->prepare("
            INSERT INTO historico_peso (usuario_id, peso, imc, data_registro)
            VALUES (:usuario_id, :peso, :imc, NOW())
        ");
        $stmtHistorico->bindParam(":usuario_id", $usuario->id);
        $stmtHistorico->bindParam(":peso", $peso);
        $stmtHistorico->bindParam(":imc", $imc);
        $stmtHistorico->execute();

        enviarSucesso(200, ["mensagem" => "Peso e IMC atualizados com sucesso!"]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao atualizar progresso: " . $e->getMessage());
    }
}

// =======================
// PATCH: Alterar meta
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PATCH") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["tipo_meta"])) {
        enviarErro(400, "Tipo de meta é obrigatório");
    }

    try {
        $tipo_meta = $data["tipo_meta"];
        $valor_desejado = $data["valor_desejado"] ?? null;

        // Buscar perguntas_id do usuário
        $stmt = $pdo->prepare("SELECT perguntas_id FROM usuarios WHERE id = :id");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();
        $dadosUsuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dadosUsuario || !$dadosUsuario['perguntas_id']) {
            enviarErro(404, "Usuário sem questionário preenchido");
        }

        // Atualizar meta
        $stmt = $pdo->prepare("
            UPDATE pergunta5_meta
            SET tipo_meta = :tipo_meta,
                valor_desejado = :valor_desejado
            WHERE perguntas_id = :perguntas_id
        ");
        $stmt->bindParam(":tipo_meta", $tipo_meta);
        $stmt->bindParam(":valor_desejado", $valor_desejado);
        $stmt->bindParam(":perguntas_id", $dadosUsuario['perguntas_id']);
        $stmt->execute();

        enviarSucesso(200, ["mensagem" => "Meta alterada com sucesso!"]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao alterar meta: " . $e->getMessage());
    }
}
?>