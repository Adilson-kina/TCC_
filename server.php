<?php
// Exibir erros no PHP para depuração
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurações de CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Responder requisições OPTIONS (preflight)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    header("HTTP/1.1 200 OK");
    exit();
}

// Conectar ao banco
try {
    $pdo = new PDO("mysql:host=localhost;dbname=tcc_db", "root", "root");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro na conexão com o banco: " . $e->getMessage()]);
    exit();
}

// Capturar método da requisição
$requestMethod = $_SERVER["REQUEST_METHOD"];
$data = json_decode(file_get_contents("php://input"), true);

// Requisição POST para cadastro ou login
if ($requestMethod === "POST" && isset($_GET["endpoint"])) {
    if ($_GET["endpoint"] === "cadastro") {
        if (!empty($data["nome"]) && !empty($data["email"]) && !empty($data["senha"])) {
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
    } elseif ($_GET["endpoint"] === "login") {
        if (!empty($data["email"]) && !empty($data["senha"])) {
            $stmt = $pdo->prepare("SELECT id, senha FROM usuarios WHERE email = :email AND ativo = 'true'");
            $stmt->bindParam(":email", $data["email"]);
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && password_verify($data["senha"], $usuario["senha"])) {
                echo json_encode(["mensagem" => "Login bem-sucedido!", "id" => $usuario["id"]]);
            } else {
                echo json_encode(["erro" => "Email ou senha incorretos"]);
            }
        } else {
            echo json_encode(["erro" => "Dados inválidos"]);
        }
    }
    exit();
}

else if ($requestMethod === "DELETE") {
    $data = json_decode(file_get_contents("php://input"), true);

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