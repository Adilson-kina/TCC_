<?php

// Exibir erros no PHP para depuração
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurações de CORS
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Responder requisições OPTIONS (preflight)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    header("HTTP/1.1 200 OK");
    exit();
}

// Definir método da requisição
$requestMethod = $_SERVER["REQUEST_METHOD"];

try {
    // Configuração do banco de dados
    $pdo = new PDO("mysql:host=localhost;dbname=tcc_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($requestMethod === "POST") {
        // Capturar e validar os dados da requisição
        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data["nome"]) && !empty($data["email"]) && !empty($data["senha"])) {
            $senhaHash = password_hash($data["senha"], PASSWORD_DEFAULT);

            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)");
            $stmt->bindParam(":nome", $data["nome"]);
            $stmt->bindParam(":email", $data["email"]);
            $stmt->bindParam(":senha", $senhaHash);

            if ($stmt->execute()) {
                $userId = $pdo->lastInsertId();
                echo json_encode(["mensagem" => "Usuário criado!", "id" => $userId, "dados" => $data]);
                exit();
            } else {
                echo json_encode(["erro" => "Erro ao inserir no banco"]);
                exit();
            }
        } else {
            echo json_encode(["erro" => "Dados inválidos"]);
            exit();
        }
    } 

    else if ($requestMethod === "DELETE") {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data["id"])) {
            $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 'false' WHERE id = :id");
            $stmt->bindParam(":id", $data["id"], PDO::PARAM_INT);

            if ($stmt->execute()) {
                echo json_encode(["mensagem" => "Usuário deletado com sucesso!", "id" => $data["id"]]);
                exit();
            } else {
                echo json_encode(["erro" => "Erro ao atualizar o status do usuário"]);
                exit();
            }
        } else {
            echo json_encode(["erro" => "ID do usuário não fornecido"]);
            exit();
        }
    } 

    else if ($requestMethod === "GET") {
        if (!empty($_GET["id"])) { // Buscar um usuário específico
            $stmt = $pdo->prepare("SELECT id, nome, email, ativo FROM usuarios WHERE id = :id");
            $stmt->bindParam(":id", $_GET["id"], PDO::PARAM_INT);
            $stmt->execute();
            
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                echo json_encode($usuario);
            } else {
                echo json_encode(["erro" => "Usuário não encontrado"]);
            }
            exit();
        } else { // Buscar todos os usuários ativos
            $stmt = $pdo->query("SELECT id, nome, email, ativo FROM usuarios WHERE ativo = 'true'");
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($usuarios);
            exit();
        }
    } 

    else {
        echo json_encode(["erro" => "Método não permitido"]);
        exit();
    }

} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro do banco de dados: " . $e->getMessage()]);
    exit();
}

?>
