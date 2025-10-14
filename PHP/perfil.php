<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . '/config.php');

// Verifica se é POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["erro" => "Método não permitido"]);
    exit();
}

// Verifica token JWT
$usuario = verificarToken($jwtSecretKey);

// Recebe respostas
$data = json_decode(file_get_contents("php://input"), true);
$respostas = $data["respostas"] ?? [];

if (!is_array($respostas) || empty($respostas)) {
    echo json_encode(["erro" => "Respostas não fornecidas"]);
    exit();
}

// Inicializa pontuação por perfil
$pontuacao = [
    "perfil_1" => 0,
    "perfil_2" => 0,
    "perfil_3" => 0,
    "perfil_4" => 0
];

// Exemplo de regras de pontuação com base nas respostas
// Pergunta 1: Qual seria o seu objetivo?
switch ($data["objetivo"] ?? "") {
    case "perder": $pontuacao["perfil_1"] += 2; break;
    case "ganhar": $pontuacao["perfil_2"] += 2; break;
    case "manter": $pontuacao["perfil_3"] += 2; break;
}

// Pergunta 2: Possui algum desafio pessoal a seguir?
switch ($data["desafio"] ?? "") {
    case "desafio1": $pontuacao["perfil_1"] += 2; break;
    case "desafio2": $pontuacao["perfil_2"] += 2; break;
    case "desafio3": $pontuacao["perfil_3"] += 2; break;
}

// Pergunta 3: Você já fez contagem calórica?
if (($data["contagem_calorica"] ?? "") === "sim") {
    $pontuacao["perfil_1"] += 1;
}

// Pergunta 4: Você já fez jejum intermitente?
if (($data["jejum_intermitente"] ?? "") === "sim") {
    $pontuacao["perfil_2"] += 1;
}

// Pergunta 5: Como deseja atingir o seu objetivo (da pergunta 1)?
foreach ($data["atingir_objetivo"] ?? [] as $metodo) {
    switch ($metodo) {
        case "dietas": $pontuacao["perfil_1"] += 1; break;
        case "contagem_calorica": $pontuacao["perfil_2"] += 1; break;
        case "jejum_intermitente": $pontuacao["perfil_3"] += 1; break;
    }
}

// Pergunta 6: Qual seu sexo biológico?
if (($data["sexo_biologico"] ?? "") === "m") {
    $pontuacao["perfil_1"] += 1;
}

// Pergunta 7: Qual sua idade?
$dataNascimento = $data["data_nascimento"] ?? null;

if ($dataNascimento) {
    $nascimento = new DateTime($dataNascimento);
    $hoje = new DateTime();
    $idade = $nascimento->diff($hoje)->y;

    if ($idade >= 18) {
        $pontuacao["perfil_1"] += 1;
    } else {
        $pontuacao["perfil_2"] += 1;
    }
}

// Pergunta 8: Qual sua altura?
if (($data["altura"] ?? "") > 170) {
    $pontuacao["perfil_1"] += 1;
} else {
    $pontuacao["perfil_2"] += 1;
}

// Pergunta 9: Qual seu nível de atividade física?
if (($data["nivel_atividade"] ?? "") === "alto") {
    $pontuacao["perfil_1"] += 1;
} else {
    $pontuacao["perfil_2"] += 1;
}

// Pergunta 10: Qual seu peso atual?
if (($data["peso"] ?? "") > 60) {
    $pontuacao["perfil_1"] += 1;
} else {
    $pontuacao["perfil_2"] += 1;
}

// Pergunta 11: Qual meta a ser alcançada?
if (($data["meta"] ?? "") === "meta1") {
    $pontuacao["perfil_1"] += 1;
}

// Pergunta 12: Você tem algum evento previsto?
if (($data["evento"] ?? "") === "sim") {
    $pontuacao["perfil_1"] += 1;
} else {
    $pontuacao["perfil_2"] += 1;
}

// Pergunta 13: Qual dieta você gostaria de seguir?
if (($data["tipo_dieta"] ?? "") === "vegana") {
    $pontuacao["perfil_1"] += 1;
} else if (($data["tipo_dieta"] ?? "") === "cetogenica") {
    $pontuacao["perfil_2"] += 1;
} else {
    $pontuacao["perfil_3"] += 1;
}

// Pergunta 14: Você precisa comer mais nos fins de semana?
if (($data["comer_fds"] ?? "") === "sim") {
    $pontuacao["perfil_1"] += 2;
}

// Pergunta 15: Você possui algum distúrbio que afete a alimentação?
$disturbios = $data["disturbios"] ?? [];

$pontuacaoDisturbios = [
    "disturbio1" => ["perfil_1" => 2],
    "disturbio2" => ["perfil_2" => 1],
];

foreach ($disturbios as $disturbio) {
    foreach ($pontuacaoDisturbios[$disturbio] ?? [] as $perfil => $pontos) {
        $pontuacao[$perfil] += $pontos;
    }
}

// Pergunta 16: Possui alguma forma preferida de avaliação?
foreach ($data["forma_avaliacao"] ?? [] as $forma) {
    switch ($forma) {
        case "peso": $pontuacao["perfil_1"] += 1; break;
        case "medidas": $pontuacao["perfil_2"] += 1; break;
        case "historico": $pontuacao["perfil_3"] += 1; break;
    }
}

// Pergunta 17: Você possui alguma dieta?
if (($data["possui_dieta"] ?? "") === "sim") {
    $pontuacao["perfil_1"] += 2;
}

// Determina perfil com maior pontuação
$perfilFinal = array_keys($pontuacao, max($pontuacao))[0];

// Salva perfil e novas informações no banco de dados
try {
    $stmt = $pdo->prepare("
        UPDATE usuarios 
        SET perfil = :perfil,
            sexo_biologico = :sexo,
            data_nascimento = :nascimento,
            altura = :altura,
            peso = :peso
        WHERE id = :id
    ");

    $stmt->bindParam(":perfil", $perfilFinal);
    $stmt->bindParam(":sexo", $data["sexo_biologico"]);
    $stmt->bindParam(":nascimento", $data["data_nascimento"]);
    $stmt->bindParam(":altura", $data["altura"]);
    $stmt->bindParam(":peso", $data["peso"]);
    $stmt->bindParam(":id", $usuario->id);

    $stmt->execute();
} catch (PDOException $e) {
    echo json_encode(["erro" => "Erro ao salvar perfil: " . $e->getMessage()]);
    exit();
}

// Retorna resultado
echo json_encode([
    "mensagem" => "Perfil calculado com sucesso!",
    "perfil" => $perfilFinal,
]);
?>