<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET", "PUT", "DELETE"]);

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
                u.imc,
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
// PUT: Atualizar dados do perfil
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $nome = $data["nome"];
        $altura = $data["altura"];
        $peso = $data["peso"];
        $senha = $data["senha"] ?? null;

        $alturaM = $altura / 100;
        $imc = ($alturaM > 0) ? round($peso / ($alturaM * $alturaM), 1) : null;

        if (!empty($senha)) {
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("
                UPDATE usuarios SET 
                    nome = :nome,
                    altura = :altura,
                    peso = :peso,
                    imc = :imc,
                    senha = :senha
                WHERE id = :id
            ");
            $stmt->bindParam(":senha", $senhaHash);
        } else {
            $stmt = $pdo->prepare("
                UPDATE usuarios SET 
                    nome = :nome,
                    altura = :altura,
                    peso = :peso,
                    imc = :imc
                WHERE id = :id
            ");
        }

        $stmt->bindParam(":nome", $nome);
        $stmt->bindParam(":altura", $altura);
        $stmt->bindParam(":peso", $peso);
        $stmt->bindParam(":imc", $imc);
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
        $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 0 WHERE id = :id");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();

        echo json_encode(["mensagem" => "Conta desativada com sucesso"]);
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao desativar conta: " . $e->getMessage()]);
        exit();
    }
}
?>