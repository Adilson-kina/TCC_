<?php
// config.php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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

// ⚠️ CONFIGURAÇÕES DO INFINITYFREE - ALTERE AQUI! ⚠️
define('DB_HOST', 'sql110.infinityfree.com');
define('DB_NAME', 'if0_40271620_dietase_db');
define('DB_USER', 'if0_40271620');
define('DB_PASS', 'wQgSmEdRwKDAH');

// Conexão com o banco
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    enviarErro(500, "Erro na conexão com o banco: " . $e->getMessage());
}

// Função para pegar headers
function getAuthHeader() {
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

// ✅ JWT SEM FIREBASE (compatível 100%)
function gerarToken(array $payload, string $jwtSecretKey): string {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    
    $payload['exp'] = time() + (60 * 60 * 24 * 30); // 30 dias
    $payload = json_encode($payload);
    $payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', "$header.$payload", $jwtSecretKey, true);
    $signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return "$header.$payload.$signature";
}

function verificarToken($jwtSecretKey) {
    $authHeader = getAuthHeader();
    
    if (empty($authHeader)) {
        enviarErro(401, "Token não fornecido.");
    }
    
    if (!preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        enviarErro(401, "Formato de token inválido.");
    }
    
    $jwt = $matches[1];
    $parts = explode('.', $jwt);
    
    if (count($parts) !== 3) {
        enviarErro(401, "Token malformado.");
    }
    
    [$header, $payload, $signature] = $parts;
    
    // Valida assinatura
    $validSignature = hash_hmac('sha256', "$header.$payload", $jwtSecretKey, true);
    $validSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));
    
    if ($signature !== $validSignature) {
        enviarErro(401, "Assinatura inválida.");
    }
    
    // Decodifica payload
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload));
    $data = json_decode($payload, true);
    
    if (!$data) {
        enviarErro(401, "Payload inválido.");
    }
    
    // Valida expiração
    if (isset($data['exp']) && $data['exp'] < time()) {
        enviarErro(401, "Token expirado.");
    }
    
    return (object)$data;
}

// Função para validar métodos permitidos
function permitirMetodos(array $metodos) {
    if (!in_array($_SERVER["REQUEST_METHOD"], $metodos)) {
        enviarErro(405, "Método não permitido.");
    }
}
?>