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
                p.pergunta11_meta AS meta,
                p.pergunta16_forma_avaliacao AS forma_avaliacao,
                u.peso_inicial,
                u.imc_inicial,
                u.peso AS peso_atual,
                u.imc AS imc_atual,
                u.altura
            FROM usuarios u
            JOIN perfis p ON u.perfil_id = p.id
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
// PUT: Atualizar progresso
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        // Busca forma de avaliação e dados de IMC
        $stmt = $pdo->prepare("
            SELECT p.pergunta16_forma_avaliacao, u.altura, u.peso_inicial, u.imc_inicial
            FROM usuarios u
            JOIN perfis p ON u.perfil_id = p.id
            WHERE u.id = :id
        ");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();
        $avaliacao = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$avaliacao) {
            echo json_encode(["erro" => "Perfil não encontrado"]);
            exit();
        }

        $forma = $avaliacao["pergunta16_forma_avaliacao"];
        $alturaCm = $avaliacao["altura"];
        $pesoInicial = $avaliacao["peso_inicial"];
        $imcInicial = $avaliacao["imc_inicial"];

        if ($forma === "medidas") {
            if (!isset($data["cintura"], $data["quadril"], $data["peito"])) {
                echo json_encode(["erro" => "Dados de medidas incompletos"]);
                exit();
            }

            $stmt = $pdo->prepare("
                UPDATE usuarios
                SET medida_cintura = :cintura,
                    medida_quadril = :quadril,
                    medida_peito = :peito
                WHERE id = :id
            ");
            $stmt->bindParam(":cintura", $data["cintura"]);
            $stmt->bindParam(":quadril", $data["quadril"]);
            $stmt->bindParam(":peito", $data["peito"]);
            $stmt->bindParam(":id", $usuario->id);
            $stmt->execute();

            echo json_encode(["mensagem" => "Medidas atualizadas com sucesso!"]);
        } else {
            if (!isset($data["peso"])) {
                echo json_encode(["erro" => "Peso não informado"]);
                exit();
            }

            $peso = $data["peso"];
            $alturaM = $alturaCm / 100;
            $imc = ($alturaM > 0) ? round($peso / ($alturaM * $alturaM), 1) : null;

            // Atualiza peso e IMC atual
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
        }
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao atualizar progresso: " . $e->getMessage()]);
        exit();
    }
}
?>