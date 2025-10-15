<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Verifica se o método é permitido
if (!in_array($_SERVER["REQUEST_METHOD"], ["GET", "POST", "DELETE"])) {
    echo json_encode(["erro" => "Método não permitido"]);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

// Verifica token JWT
$usuario = verificarToken($jwtSecretKey);

// =======================
// GET: Obter dados do perfil
// =======================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                u.nome,
                u.altura,
                u.peso,
                u.data_nascimento,
                p.pergunta13_tipo_dieta
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

        echo json_encode($dados);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao buscar perfil: " . $e->getMessage()]);
        exit();
    }
}

// =======================
// POST: Atualizar dados do perfil
// =======================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $stmt = $pdo->prepare("
            UPDATE usuarios SET 
                nome = :nome,
                altura = :altura,
                peso = :peso,
                senha = :senha
            WHERE id = :id
        ");

        $senhaHash = password_hash($data["senha"], PASSWORD_DEFAULT);

        $stmt->bindParam(":nome", $data["nome"]);
        $stmt->bindParam(":altura", $data["altura"]);
        $stmt->bindParam(":peso", $data["peso"]);
        $stmt->bindParam(":senha", $senhaHash);
        $stmt->bindParam(":id", $usuario->id);

        $stmt->execute();

        echo json_encode(["mensagem" => "Perfil atualizado com sucesso"]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao atualizar perfil: " . $e->getMessage()]);
        exit();
    }
}

// =======================
// DELETE: Desativar conta
// =======================
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 'false' WHERE id = :id");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();

        echo json_encode(["mensagem" => "Conta desativada com sucesso"]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao desativar conta: " . $e->getMessage()]);
        exit();
    }
}
?>  