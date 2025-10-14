<?php
// Exibir erros no PHP para depuração
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Autoload do Composer (necessário para usar Firebase JWT)
require_once 'vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Chave secreta para assinar o token JWT
$jwtSecretKey = "dietasecreta";

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

// Conectar ao banco
try {
    $pdo = new PDO("mysql:host=localhost;dbname=tcc_db", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro na conexão com o banco: " . $e->getMessage()]);
    exit();
}

// Função para validar o token JWT
function verificarToken($jwtSecretKey) {
    $headers = getallheaders();
    $authHeader = $headers["Authorization"] ?? '';

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        try {
            $decoded = JWT::decode($jwt, new Key($jwtSecretKey, 'HS256'));
            return $decoded;
        } catch (Exception $e) {
            echo json_encode(["erro" => "Token inválido"]);
            exit();
        }
    } else {
        echo json_encode(["erro" => "Token não fornecido"]);
        exit();
    }
}
?>