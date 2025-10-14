<?php
// Configurações de CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Responder requisições OPTIONS (preflight)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    header("HTTP/1.1 200 OK");
    exit();
}

require_once(__DIR__ . '/config.php');

$requestMethod = $_SERVER["REQUEST_METHOD"];
$data = json_decode(file_get_contents("php://input"), true);

// =======================
// POST: Cadastro ou Login
// =======================
if ($requestMethod === "POST" && isset($_GET["endpoint"])) {
    $endpoint = $_GET["endpoint"];

    if ($endpoint === "cadastro") {
        if (!empty($data["nome"]) && !empty($data["email"]) && !empty($data["senha"])) {
            $stmt = $pdo->prepare("SELECT email FROM usuarios WHERE email = :email");
            $stmt->bindParam(":email", $data["email"]);
            $stmt->execute();

            if ($stmt->fetch()) {
                echo json_encode(["erro" => "Usuário já existente"]);
                exit();
            }

            $senhaHash = password_hash($data["senha"], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, ativo) VALUES (:nome, :email, :senha, 'true')");
            $stmt->bindParam(":nome", $data["nome"]);
            $stmt->bindParam(":email", $data["email"]);
            $stmt->bindParam(":senha", $senhaHash);

            echo $stmt->execute()
                ? json_encode(["mensagem" => "Usuário criado!", "id" => $pdo->lastInsertId()])
                : json_encode(["erro" => "Erro ao cadastrar usuário."]);
        } else {
            echo json_encode(["erro" => "Dados inválidos"]);
        }

    } elseif ($endpoint === "login") {
        if (!empty($data["email"]) && !empty($data["senha"])) {
            $stmt = $pdo->prepare("SELECT id, nome, email, senha FROM usuarios WHERE email = :email AND ativo = 'true'");
            $stmt->bindParam(":email", $data["email"]);
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && password_verify($data["senha"], $usuario["senha"])) {
                $payload = [
                    "id" => $usuario["id"],
                    "email" => $usuario["email"],
                    "nome" => $usuario["nome"],
                    "exp" => time() + (60 * 60 * 24) // Expira em 24 horas
                ];
                $jwt = gerarToken($payload, $jwtSecretKey);

                echo json_encode([
                    "mensagem" => "Login bem-sucedido!",
                    "id" => $usuario["id"],
                    "token" => $jwt
                ]);
            } else {
                echo json_encode(["erro" => "Email ou senha incorretos"]);
            }
        } else {
            echo json_encode(["erro" => "Dados inválidos"]);
        }
    }

    exit();
}

// =======================
// DELETE: Desativar usuário
// =======================
if ($requestMethod === "DELETE") {
    if (!empty($data["id"]) && !empty($data["senha"])) {
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = :id AND ativo = 'true'");
        $stmt->bindParam(":id", $data["id"], PDO::PARAM_INT);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($data["senha"], $usuario["senha"])) {
            $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 'false' WHERE id = :id");
            $stmt->bindParam(":id", $data["id"], PDO::PARAM_INT);

            echo $stmt->execute()
                ? json_encode(["mensagem" => "Usuário deletado com sucesso!", "id" => $data["id"]])
                : json_encode(["erro" => "Erro ao deletar usuário"]);
        } else {
            echo json_encode(["erro" => "Senha incorreta"]);
        }
    } else {
        echo json_encode(["erro" => "ID ou senha não fornecidos"]);
    }

    exit();
}

// =======================
// GET: Buscar usuários
// =======================
if ($requestMethod === "GET") {
    if (!empty($_GET["id"])) {
        $stmt = $pdo->prepare("SELECT id, nome, email, ativo FROM usuarios WHERE id = :id AND ativo = 'true'");
        $stmt->bindParam(":id", $_GET["id"], PDO::PARAM_INT);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        echo $usuario
            ? json_encode($usuario)
            : json_encode(["erro" => "Usuário não encontrado ou inativo"]);
    } else {
        $stmt = $pdo->query("SELECT id, nome, email, ativo FROM usuarios WHERE ativo = 'true'");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    exit();
}

// =======================
// Método não permitido
// =======================
echo json_encode(["erro" => "Método não permitido"]);
exit();