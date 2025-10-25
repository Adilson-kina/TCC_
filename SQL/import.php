<?php
require_once(__DIR__ . '/../php/config/config.php'); // Ajuste conforme seu projeto

$arquivo = __DIR__ . '/tabela_alimentos.csv';

if (!file_exists($arquivo)) {
    die("Arquivo CSV não encontrado.");
}

// Função para tratar valores
function trata($valor) {
    $valor = trim($valor);
    if ($valor === '' || strtoupper($valor) === 'NA' || strtoupper($valor) === 'TR') return null;
    return str_replace(',', '.', $valor);
}

$csv = fopen($arquivo, 'r');
$header = fgetcsv($csv, 0, ';'); // Lê o cabeçalho

while (($linha = fgetcsv($csv, 0, ';')) !== false) {
    if (count($linha) < 28) continue; // Garante que tem todas as colunas

    array_shift($linha); // Ignora a primeira coluna

    list(
        $nome, $categoria, $umidade_porcentagem, $energia_kcal, $proteina_g, $lipideos_g, $colesterol_g,
        $carboidrato_g, $fibra_g, $cinzas_g, $calcio_g, $magnesio_g, $manganes_mg, $fosforo_mg,
        $ferro_mg, $sodio_mg, $potassio_mg, $cobre_mg, $zinco_mg, $retinol_mcg, $re_mcg, $rae_mcg,
        $tiamina_mg, $riboflavina_mg, $piridoxina_mg, $niacina_mg, $vitamina_c_mg
    ) = $linha;

    $stmt = $pdo->prepare("
        INSERT INTO alimentos (
            nome, categoria, umidade_porcentagem, energia_kcal, proteina_g, lipideos_g, colesterol_g,
            carboidrato_g, fibra_g, cinzas_g, calcio_g, magnesio_g, manganes_mg, fosforo_mg,
            ferro_mg, sodio_mg, potassio_mg, cobre_mg, zinco_mg, retinol_mcg, re_mcg, rae_mcg,
            tiamina_mg, riboflavina_mg, piridoxina_mg, niacina_mg, vitamina_c_mg
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        trata($nome), trata($categoria), trata($umidade_porcentagem), trata($energia_kcal), trata($proteina_g),
        trata($lipideos_g), trata($colesterol_g), trata($carboidrato_g), trata($fibra_g), trata($cinzas_g),
        trata($calcio_g), trata($magnesio_g), trata($manganes_mg), trata($fosforo_mg), trata($ferro_mg),
        trata($sodio_mg), trata($potassio_mg), trata($cobre_mg), trata($zinco_mg), trata($retinol_mcg),
        trata($re_mcg), trata($rae_mcg), trata($tiamina_mg), trata($riboflavina_mg), trata($piridoxina_mg),
        trata($niacina_mg), trata($vitamina_c_mg)
    ]);
}

fclose($csv);
?>