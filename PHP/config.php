<?php
// Exibir erros para depuração
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Autoload do Composer (Firebase JWT)
require_once __DIR__ . '/../vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Chave secreta JWT
$jwtSecretKey = "dietasecreta";

// Conexão com o banco
try {
    $pdo = new PDO("mysql:host=localhost;dbname=tcc_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro na conexão com o banco: " . $e->getMessage()]);
    exit();
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
            echo json_encode(["erro" => "Token inválido"]);
            exit();
        }
    } else {
        echo json_encode(["erro" => "Token não fornecido"]);
        exit();
    }
}

function gerarToken(array $payload, string $jwtSecretKey): string {
    return JWT::encode($payload, $jwtSecretKey, 'HS256');
}
?>