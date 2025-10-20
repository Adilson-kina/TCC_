<?php
// Configurações de CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Responder requisições OPTIONS (preflight)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    header("HTTP/1.1 200 OK");
    exit();
}

// Importa configurações do 'config.php'
require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET", "POST"]);

$requestMethod = $_SERVER["REQUEST_METHOD"];
$data = json_decode(file_get_contents("php://input"), true);

// =======================
// POST: Cadastro do usuário
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
            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)");
            $stmt->bindParam(":nome", $data["nome"]);
            $stmt->bindParam(":email", $data["email"]);
            $stmt->bindParam(":senha", $senhaHash);

            echo $stmt->execute()
                ? json_encode(["mensagem" => "Usuário criado!", "id" => $pdo->lastInsertId()])
                : json_encode(["erro" => "Erro ao cadastrar usuário."]);
        } else {
            echo json_encode(["erro" => "Dados inválidos"]);
        }

// =======================
// POST: Login do usuário
// =======================
    } elseif ($endpoint === "login") {
        if (!empty($data["email"]) && !empty($data["senha"])) {
            $stmt = $pdo->prepare("SELECT id, nome, email, senha FROM usuarios WHERE email = :email AND ativo = 1");
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