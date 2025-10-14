<?php
require_once 'config.php';

$requestMethod = $_SERVER["REQUEST_METHOD"];
$data = json_decode(file_get_contents("php://input"), true);

if ($requestMethod === "POST" && isset($_GET["endpoint"])) {
    
    // Requisição POST para cadastro
    if ($_GET["endpoint"] === "cadastro") {
        if (!empty($data["nome"]) && !empty($data["email"]) && !empty($data["senha"])) {
            $stmt = $pdo->prepare("SELECT email FROM usuarios WHERE email = :email");
            $stmt->bindParam(":email", $data["email"]);
            $stmt->execute();
            $usuarioExiste = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($usuarioExiste) {
                echo json_encode(["erro" => "Usuário já existente"]);
                exit(1);
            }
            $senhaHash = password_hash($data["senha"], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha, ativo) VALUES (:nome, :email, :senha, 'true')");
            $stmt->bindParam(":nome", $data["nome"]);
            $stmt->bindParam(":email", $data["email"]);
            $stmt->bindParam(":senha", $senhaHash);

            if ($stmt->execute()) {
                echo json_encode(["mensagem" => "Usuário criado!", "id" => $pdo->lastInsertId()]);
            } else {
                echo json_encode(["erro" => "Erro ao cadastrar usuário."]);
            }
        } else {
            echo json_encode(["erro" => "Dados inválidos"]);
        }

    // Requisição POST para login    
    } elseif ($_GET["endpoint"] === "login") {
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
                    "exp" => time() + (60 * 60 * 24)
                ];
                $jwt = JWT::encode($payload, $jwtSecretKey, 'HS256');

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

// Requisição DELETE para desativar usuário
if ($requestMethod === "DELETE") {
    if (!empty($data["id"]) && !empty($data["senha"])) {
        $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = :id AND ativo = 'true'");
        $stmt->bindParam(":id", $data["id"], PDO::PARAM_INT);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($data["senha"], $usuario["senha"])) {
            $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 'false' WHERE id = :id");
            $stmt->bindParam(":id", $data["id"], PDO::PARAM_INT);

            if ($stmt->execute()) {
                echo json_encode(["mensagem" => "Usuário deletado com sucesso!", "id" => $data["id"]]);
            } else {
                echo json_encode(["erro" => "Erro ao deletar usuário"]);
            }
        } else {
            echo json_encode(["erro" => "Senha incorreta"]);
        }
    } else {
        echo json_encode(["erro" => "ID ou senha não fornecidos"]);
    }
    exit();
}

// Requisição GET para buscar usuário
if ($requestMethod === "GET") {
    if (!empty($_GET["id"])) { 
        $stmt = $pdo->prepare("SELECT id, nome, email, ativo FROM usuarios WHERE id = :id AND ativo = 'true'");
        $stmt->bindParam(":id", $_GET["id"], PDO::PARAM_INT);
        $stmt->execute();
        
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario) {
            echo json_encode($usuario);
        } else {
            echo json_encode(["erro" => "Usuário não encontrado ou inativo"]);
        }
        exit();
    } else {
        $stmt = $pdo->query("SELECT id, nome, email, ativo FROM usuarios WHERE ativo = 'true'");
        $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($usuarios);
        exit();
    }
}

// Caso a requisição não corresponda a nenhum método esperado
echo json_encode(["erro" => "Método não permitido"]);
exit();
?>