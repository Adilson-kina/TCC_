<?php
// config.php - Versão Railway

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Chave secreta JWT
$jwtSecretKey = getenv('JWT_SECRET') ?: "dietasecreta";

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

// 🚀 CONFIGURAÇÃO AUTOMÁTICA - Railway ou Local
$isRailway = getenv('RAILWAY_ENVIRONMENT') !== false;

if ($isRailway) {
    // 🔥 Produção (Railway)
    $dbHost = getenv('MYSQL_HOST');
    $dbName = getenv('MYSQL_DATABASE');
    $dbUser = getenv('MYSQL_USER');
    $dbPass = getenv('MYSQL_PASSWORD');
    $dbPort = getenv('MYSQL_PORT') ?: '3306';
} else {
    // 💻 Desenvolvimento Local
    $dbHost = 'localhost';
    $dbName = 'dietase_db';
    $dbUser = 'root';
    $dbPass = '';
    $dbPort = '3306';
}

// Conexão com o banco
try {
    $pdo = new PDO(
        "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
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

// JWT SEM FIREBASE
function gerarToken(array $payload, string $jwtSecretKey): string {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    
    $payload['exp'] = time() + (60 * 60 * 24 * 30);
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
    
    $validSignature = hash_hmac('sha256', "$header.$payload", $jwtSecretKey, true);
    $validSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($validSignature));
    
    if ($signature !== $validSignature) {
        enviarErro(401, "Assinatura inválida.");
    }
    
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload));
    $data = json_decode($payload, true);
    
    if (!$data) {
        enviarErro(401, "Payload inválido.");
    }
    
    if (isset($data['exp']) && $data['exp'] < time()) {
        enviarErro(401, "Token expirado.");
    }
    
    return (object)$data;
}

function permitirMetodos(array $metodos) {
    if (!in_array($_SERVER["REQUEST_METHOD"], $metodos)) {
        enviarErro(405, "Método não permitido.");
    }
}
?>