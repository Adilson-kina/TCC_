<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Verifica se o método é permitido
if ($_SERVER["REQUEST_METHOD"] !== "GET" && $_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["erro" => "Método não permitido"]);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

// Verifica token JWT
$usuario = verificarToken($jwtSecretKey);

// =======================
// GET: Busca meta para exibir no título
// =======================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                p.pergunta11_meta AS meta,
                p.pergunta16_forma_avaliacao AS forma_avaliacao,
                u.peso,
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
            "peso_atual" => $dados["peso"],
            "altura" => $dados["altura"]
        ]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao buscar dados: " . $e->getMessage()]);
        exit();
    }
}

// =======================
// POST: Atualizar progresso (medidas ou peso)
// =======================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        // Buscar forma de avaliação
        $stmt = $pdo->prepare("
            SELECT p.pergunta16_forma_avaliacao
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

        if ($forma === "medidas") {
            // Valida se valores estão vazios
            if (!isset($data["cintura"], $data["quadril"], $data["peito"])) {
                echo json_encode(["erro" => "Dados de medidas incompletos"]);
                exit();
            }

            // Atualizar medidas 
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
            // Valida se valores estão vazios
            if (!isset($data["peso"])) {
                echo json_encode(["erro" => "Peso não informado"]);
                exit();
            }

            // Atualizar peso
            $stmt = $pdo->prepare("
                UPDATE usuarios
                SET peso = :peso
                WHERE id = :id
            ");
            $stmt->bindParam(":peso", $data["peso"]);
            $stmt->bindParam(":id", $usuario->id);
            $stmt->execute();

            echo json_encode(["mensagem" => "Peso atualizado com sucesso!"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao atualizar progresso: " . $e->getMessage()]);
        exit();
    }
}
?>