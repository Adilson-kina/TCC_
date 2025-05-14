<?php
header("Content-Type: application/json"); // Isso aqui define a resposta da requisição como JSON

$requestMethod = $_SERVER["REQUEST_METHOD"]; // É usado para retornar o tipo de requisição

if ($requestMethod === "POST") {
    $data = json_decode(file_get_contents("php://input"), true); // O "file_get_contents" lê o corpo da requisição

    if (!empty($data["nome"]) && !empty($data["email"])) { // Verifica se os campos não estão vazios
        echo json_encode(["mensagem" => "Usuário criado!", "dados" => $data]); 
    } else {
        echo json_encode(["erro" => "Dados inválidos"]);
    }

} else if ($requestMethod === "DELETE") {
    echo json_encode(["mensagem" => "Usuário deletado!"]);
} else {
    echo json_encode(["erro" => "Método não permitido"]);
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

