<?php
// Exibir erros para depuração
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Autoload do Composer (Firebase JWT)
require_once __DIR__ . '/../../vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Chave secreta JWT
$jwtSecretKey = "dietasecreta";

function enviarErro($codigo, $mensagem) {
    http_response_code($codigo);
    echo json_encode(["erro" => $mensagem]);
    exit();
}

function enviarSucesso($codigo, $dados) {
    http_response_code($codigo);
    echo json_encode($dados);
    exit();
}

// Conexão com o banco
try {
    $pdo = new PDO("mysql:host=localhost;dbname=dietase_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    enviarErro(500, "Erro na conexão com o banco: " . $e->getMessage());
}

// Função para validar token JWT
function verificarToken($jwtSecretKey) {
    $headers = getallheaders();
    $authHeader = $headers["Authorization"] ?? '';

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        try {
            return JWT::decode($jwt, new Key($jwtSecretKey, 'HS256'));
        } catch (Exception $e) {
            enviarErro(401, "Token inválido.");
        }
    } else {
        enviarErro(401, "Token não fornecido.");
    }
}

function gerarToken(array $payload, string $jwtSecretKey): string {
    return JWT::encode($payload, $jwtSecretKey, 'HS256');
}

// Função para validar métodos permitidos
function permitirMetodos(array $metodos) {
    if (!in_array($_SERVER["REQUEST_METHOD"], $metodos)) {
        enviarErro(405, "Método não permitido.");
    }
}
?>