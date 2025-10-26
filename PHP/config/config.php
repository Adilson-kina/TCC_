<?php
// Autoload do Composer (Firebase JWT)
require_once __DIR__ . '/../../vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Chave secreta JWT
$jwtSecretKey = "dietasecreta";

function enviarErro($codigo, $mensagem) {
    http_response_code($codigo);
    echo json_encode(["erro" => $mensagem], JSON_UNESCAPED_UNICODE);
    exit();
}

function enviarSucesso($codigo, $dados) {
    http_response_code($codigo);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit();
}

// Conexão com o banco
try {
    $pdo = new PDO("mysql:host=localhost;dbname=dietase_db;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    enviarErro(500, "Erro na conexão com o banco: " . $e->getMessage());
}

// ✅ FUNÇÃO CORRIGIDA: Pegar headers de forma compatível
function getAuthHeader() {
    // Tenta diferentes formas de obter o header Authorization
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            return $headers['Authorization'];
        }
        if (isset($headers['authorization'])) {
            return $headers['authorization'];
        }
    }
    
    return '';
}

// ✅ Função para validar token JWT (CORRIGIDA)
function verificarToken($jwtSecretKey) {
    $authHeader = getAuthHeader();
    
    if (empty($authHeader)) {
        enviarErro(401, "Token não fornecido.");
    }
    
    if (preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        try {
            return JWT::decode($jwt, new Key($jwtSecretKey, 'HS256'));
        } catch (Exception $e) {
            enviarErro(401, "Token inválido: " . $e->getMessage());
        }
    } else {
        enviarErro(401, "Formato de token inválido.");
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