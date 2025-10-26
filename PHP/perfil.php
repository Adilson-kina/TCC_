<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'config.php');

permitirMetodos(["GET", "PUT", "DELETE"]);

// Verifica token JWT
$usuario = verificarToken($jwtSecretKey);

// =======================
// GET: Obter dados do perfil
// =======================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                u.nome,
                u.altura,
                u.peso_inicial,
                u.peso,
                u.imc,
                u.imc_inicial,
                u.data_nascimento,
                p.pergunta6_tipo_dieta
            FROM usuarios u
            JOIN perguntas p ON u.perguntas_id = p.id
            WHERE u.id = :id
        ");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$dados) {
            enviarErro(404, "Perfil não encontrado.");
        }

        // Se a pergunta estiver nula, usa "Nenhuma" como fallback
        $dados["pergunta6_tipo_dieta"] = !empty($dados["pergunta6_tipo_dieta"]) ? $dados["pergunta6_tipo_dieta"] : "nenhuma";

        // Se peso estiver nulo, usa peso_inicial como fallback
        $dados["peso"] = $dados["peso"] ?? $dados["peso_inicial"];

        // Se imc estiver nulo, usa imc_inicial como fallback
        $dados["imc"] = $dados["imc"] ?? $dados["imc_inicial"];

        enviarSucesso(200, [
        "mensagem" => "Dados do perfil carregados com sucesso!",
            "nome" => $dados["nome"],
            "altura" => $dados["altura"],
            "peso" => $dados["peso"],
            "imc" => $dados["imc"],
            "data_nascimento" => $dados["data_nascimento"],
            "tipo_dieta" => $dados["pergunta6_tipo_dieta"]
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao buscar perfil: " . $e->getMessage());
    }
}

// =======================
// PUT: Atualizar dados do perfil
// =======================
if ($_SERVER["REQUEST_METHOD"] === "PUT") {
    $data = json_decode(file_get_contents("php://input"), true);

    try {
        $nome = $data["nome"];
        $altura = $data["altura"];
        $peso = $data["peso"];
        $senha = $data["senha"] ?? null;

        $alturaMetros = $altura / 100;
        $imc = ($alturaMetros > 0) ? $peso / ($alturaMetros * $alturaMetros) : null;

        if (!empty($senha)) {
            $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("
                UPDATE usuarios SET 
                    nome = :nome,
                    altura = :altura,
                    peso = :peso,
                    imc = :imc,
                    senha = :senha
                WHERE id = :id
            ");
            $stmt->bindParam(":senha", $senhaHash);
        } else {
            $stmt = $pdo->prepare("
                UPDATE usuarios SET 
                    nome = :nome,
                    altura = :altura,
                    peso = :peso,
                    imc = :imc
                WHERE id = :id
            ");
        }

        $stmt->bindParam(":nome", $nome);
        $stmt->bindParam(":altura", $altura);
        $stmt->bindParam(":peso", $peso);
        $stmt->bindParam(":imc", $imc);
        $stmt->bindParam(":id", $usuario->id);

        $stmt->execute();

        enviarSucesso(200, [
        "mensagem" => "Perfil atualizado com sucesso!",
            "nome" => $data["nome"],
            "altura" => $data["altura"],
            "peso" => $data["peso"],
            "imc" => $imc,
            "id" => $usuario->id
        ]);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao atualizar perfil: " . $e->getMessage());
    }
}

// =======================
// DELETE: Desativar conta
// =======================
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    try {
        $stmt = $pdo->prepare("UPDATE usuarios SET ativo = 0 WHERE id = :id");
        $stmt->bindParam(":id", $usuario->id);
        $stmt->execute();

        enviarSucesso(204, []);
    } catch (PDOException $e) {
        enviarErro(500, "Erro ao desativar conta: " . $e->getMessage());
    }
}
?>