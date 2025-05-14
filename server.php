<?php
header("Content-Type: application/json"); // Isso aqui define a resposta da requisição como JSON

$pdo = new PDO("mysql:host=localhost;dbname=tcc_db", "root", "root"); // Configuração do banco de dados (DEIXA A SENHA EM BRANCO)
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // "ATTR_ERRMODE" define o modo de tratamento de erros e "ERRMODE_EXCEPTION" faz com que qualquer erro na execução da query gere uma exceção (Exception), que pode ser capturada e tratada

$requestMethod = $_SERVER["REQUEST_METHOD"]; // É usado para retornar o tipo de requisição

if ($requestMethod === "POST") {
    $data = json_decode(file_get_contents("php://input"), true); // O "file_get_contents" lê o corpo da requisição

    if (!empty($data["nome"]) && !empty($data["email"]) && !empty($data["senha"])) { // Verifica se os campos não estão vazios
        try {
            $senhaHash = password_hash($data["senha"], PASSWORD_DEFAULT); // Gera senha em hash

            $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (:nome, :email, :senha)");
            $stmt->bindParam(":nome", $data["nome"]);
            $stmt->bindParam(":email", $data["email"]);
            $stmt->bindParam(":senha", $senhaHash); // Armazena o hash da senha
            
            if ($stmt->execute()) {
                echo json_encode(["mensagem" => "Usuário criado!", "dados" => $data]);
            } else {
                echo json_encode(["erro" => "Erro ao inserir no banco"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["erro" => "Erro: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["erro" => "Dados inválidos"]);
    }
} 

else if ($requestMethod === "DELETE") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!empty($data["id"]) && !empty($data["senha"])) {
        try {
            $stmt = $pdo->prepare("SELECT senha FROM usuarios WHERE id = :id"); // Busca a senha armazenada no banco
            $stmt->bindParam(":id", $data["id"], PDO::PARAM_INT); // "bindParam" previne SQL Injection ligando o valor a um placeholder e "PARAM_INT" define que o valor passado é um inteiro
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario && password_verify($data["senha"], $usuario["senha"])) {
                $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 'false' WHERE id = :id"); // Com uma senha correta, a conta é desativada
                $stmt->bindParam(":id", $data["id"], PDO::PARAM_INT);
                if ($stmt->execute()) {
                    echo json_encode(["mensagem" => "Usuário desativado com sucesso!"]);
                } else {
                    echo json_encode(["erro" => "Erro ao atualizar status"]);
                }
            } else {
                echo json_encode(["erro" => "Senha incorreta"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["erro" => "Erro: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["erro" => "ID e senha são obrigatórios"]);
    }
}

else if ($requestMethod === "GET") {
    try {
        if (!empty($_GET["id"])) { // Se um ID for passado na URL, busca apenas um usuário
            $stmt = $pdo->prepare("SELECT id, nome, email, ativo FROM usuarios WHERE id = :id");
            $stmt->bindParam(":id", $_GET["id"], PDO::PARAM_INT);
            $stmt->execute();
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC); // Armazena só um usuário (uma linha do banco)

            if ($usuario) {
                echo json_encode($usuario);
            } else {
                echo json_encode(["erro" => "Usuário não encontrado"]);
            }
        } else { // Se nenhum ID for passado, busca todos os usuários ativos
            $stmt = $pdo->query("SELECT id, nome, email, ativo FROM usuarios WHERE ativo = 'true'");
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC); // Armazena todos usuários ativos
            echo json_encode($usuarios);
        }
    } catch (PDOException $e) {
        echo json_encode(["erro" => "Erro ao buscar usuários: " . $e->getMessage()]);
    }
}

/*
> EXEMPLO DE COMO FUNCIONA O "JSON_ENCODE":
    - Transforma de array/objeto PHP para JSON

    $data = ["nome" => "Gabriel", "email" => "gabriel@email.com"];
    $json = json_encode($data);

    echo $json; // Saída: {"nome":"Gabriel","email":"gabriel@email.com"}
?>

> EXEMPLO DE COMO FUNCIONA O "JSON_DECODE": 
    - Transforma de JSON para array/objeto PHP

    {
        "nome": "Gabriel",
        "email": "gabriel@email.com"
    }

    (ARRAY)
    echo "Nome: " . $data["nome"]; // Gabriel
    echo "Email: " . $data["email"]; // gabriel@email.com

    (OBJETO PHP)
    $data = json_decode($json);
    echo $data->nome; // Saída: Gabriel
*/
?>

