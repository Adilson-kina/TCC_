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

// Verifica token JWT
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
                u.altura
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            JOIN pergunta5_meta m ON m.perguntas_id = p.id
            WHERE u.id = :id
        ");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            echo json_encode(["erro" => "Perfil não encontrado"]);
            exit();
        }

        echo json_encode([
            "meta" => $dados["meta"],
            "forma_avaliacao" => $dados["forma_avaliacao"],
            "peso_inicial" => $dados["peso_inicial"],
            "imc_inicial" => $dados["imc_inicial"],
            "peso_atual" => $dados["peso_atual"],
            "imc_atual" => $dados["imc_atual"],
            "altura" => $dados["altura"]
        ]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao buscar dados: " . $e->getMessage()]);
        exit();
    }
}

// =======================
// PUT: Atualizar progresso (peso e IMC)
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["peso"])) {
        echo json_encode(["erro" => "Peso não informado"]);
        exit();
    }

    try {
        $peso = $data["peso"];

        // Busca altura atual do usuário
        $stmt = $pdo->prepare("SELECT altura FROM usuarios WHERE id = :id");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();
        $alturaCm = $stmt->fetchColumn();

        if (!$alturaCm) {
            echo json_encode(["erro" => "Altura não encontrada para o usuário"]);
            exit();
        }

        $alturaM = $alturaCm / 100;
        $imc = ($alturaM > 0) ? $peso / ($alturaM * $alturaM) : null;

        // Atualiza peso e IMC
        $stmt = $pdo->prepare("
            UPDATE usuarios
            SET peso = :peso,
                imc = :imc
            WHERE id = :id
        ");
        $stmt->bindParam(":peso", $peso);
        $stmt->bindParam(":imc", $imc);
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();

        echo json_encode(["mensagem" => "Peso e IMC atualizados com sucesso!"]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao atualizar progresso: " . $e->getMessage()]);
        exit();
    }
}
?>