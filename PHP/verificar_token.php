<?php
header("Content-Type: application/json");
require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

$usuario = verificarToken($jwtSecretKey);

echo json_encode([
    "autenticado" => true,
    "usuario_id" => $usuario->id,
    "nome" => $usuario->nome ?? null
]);
?>