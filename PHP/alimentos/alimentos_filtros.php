<?php
function aplicarFiltros($tipoDieta, $disturbios) {
    $condicoes = [];

    $filtros = [
        "carboidrato_baixo" => "CAST(carboidrato_g AS DECIMAL) <= 20",
        "carboidrato_muito_baixo" => "CAST(carboidrato_g AS DECIMAL) <= 10",
        "lipideos_baixos" => "CAST(lipideos_g AS DECIMAL) <= 10",
        "lipideos_altos" => "CAST(lipideos_g AS DECIMAL) >= 15",
        "sodio_baixo" => "CAST(sodio_mg AS DECIMAL) <= 200",
        "energia_baixa" => "CAST(energia_kcal AS DECIMAL) <= 250",
        "fibra_alta" => "CAST(fibra_g AS DECIMAL) >= 2",
        "proteina_alta" => "CAST(proteina_g AS DECIMAL) >= 10",
        "excluir_frito" => "nome NOT LIKE '%frito%'",
        "excluir_industrializado" => "nome NOT LIKE '%industrializado%'",
        "excluir_gluten" => [
            "categoria NOT IN ('Cereais e derivados', 'Massas', 'Pães')",
            "nome NOT LIKE '%trigo%'",
            "nome NOT LIKE '%centeio%'",
            "nome NOT LIKE '%cevada%'",
            "nome NOT LIKE '%glúten%'",
            "nome NOT LIKE '%massa%'",
            "nome NOT LIKE '%biscoito%'",
            "nome NOT LIKE '%bolo%'",
            "nome NOT LIKE '%farinha%'"
        ],
        "excluir_acucar" => [
            "nome NOT LIKE '%açúcar%'",
            "nome NOT LIKE '%doce%'",
            "nome NOT LIKE '%recheado%'",
            "nome NOT LIKE '%bolo%'",
            "nome NOT LIKE '%biscoito%'",
            "nome NOT LIKE '%mistura%'",
            "nome NOT LIKE '%xarope%'",
            "nome NOT LIKE '%glucose%'"
        ],
        "excluir_embutidos" => [
            "nome NOT LIKE '%linguiça%'",
            "nome NOT LIKE '%presunto%'",
            "nome NOT LIKE '%mortadela%'",
            "nome NOT LIKE '%bacon%'"
        ],
        "excluir_lactose" => [
            "nome NOT LIKE '%leite%'",
            "nome NOT LIKE '%iogurte%'",
            "nome NOT LIKE '%sorvete%'",
            "nome NOT LIKE '%requeijão%'"
        ],
        "excluir_leguminosas" => [
            "nome NOT LIKE '%feijão%'",
            "nome NOT LIKE '%lentilha%'",
            "nome NOT LIKE '%grão-de-bico%'"
        ],
        "excluir_vegetais_fermentaveis" => [
            "nome NOT LIKE '%couve-flor%'",
            "nome NOT LIKE '%brócolis%'",
            "nome NOT LIKE '%repolho%'",
            "nome NOT LIKE '%cebola%'",
            "nome NOT LIKE '%alho%'"
        ],
        "excluir_adocantes" => [
            "nome NOT LIKE '%sorbitol%'",
            "nome NOT LIKE '%xilitol%'",
            "nome NOT LIKE '%manitol%'"
        ],
        "excluir_estimulantes" => [
            "nome NOT LIKE '%café%'",
            "nome NOT LIKE '%refrigerante%'"
        ]
    ];

    // Filtros por dieta
    switch ($tipoDieta) {
        case "low_carb":
            $condicoes[] = $filtros["carboidrato_baixo"];
            break;
        case "cetogenica":
            $condicoes[] = $filtros["carboidrato_muito_baixo"];
            $condicoes[] = $filtros["lipideos_altos"];
            break;
        case "mediterranea":
            $condicoes[] = $filtros["lipideos_baixos"];
            $condicoes[] = $filtros["excluir_frito"];
            $condicoes[] = $filtros["excluir_industrializado"];
            break;
        case "vegana":
            $condicoes[] = "nome NOT LIKE '%carne%'";
            $condicoes[] = "nome NOT LIKE '%frango%'";
            $condicoes[] = "nome NOT LIKE '%peixe%'";
            $condicoes[] = "nome NOT LIKE '%ovo%'";
            $condicoes[] = "nome NOT LIKE '%leite%'";
            $condicoes[] = "nome NOT LIKE '%mel%'";
            break;
        case "vegetariana":
            $condicoes[] = "nome NOT LIKE '%carne%'";
            $condicoes[] = "nome NOT LIKE '%frango%'";
            $condicoes[] = "nome NOT LIKE '%peixe%'";
            break;
        case "paleolitica":
            $condicoes[] = "categoria NOT IN ('Cereais e derivados', 'Massas', 'Pães')";
            $condicoes[] = "nome NOT LIKE '%farinha%'";
            $condicoes[] = "nome NOT LIKE '%leite%'";
            break;
        case "dieta_das_zonas":
            $condicoes[] = $filtros["carboidrato_baixo"];
            $condicoes[] = $filtros["proteina_alta"];
            $condicoes[] = $filtros["lipideos_baixos"];
            break;
    }

    // Filtros por distúrbios
    if (str_contains($disturbios, "celíaca")) {
        $condicoes = array_merge($condicoes, $filtros["excluir_gluten"]);
    }
    if (str_contains($disturbios, "diabetes")) {
        $condicoes[] = $filtros["carboidrato_baixo"];
        $condicoes[] = $filtros["fibra_alta"];
        $condicoes[] = $filtros["energia_baixa"];
        $condicoes[] = $filtros["lipideos_baixos"];
        $condicoes = array_merge($condicoes, $filtros["excluir_acucar"]);
        $condicoes[] = $filtros["excluir_frito"];
        $condicoes[] = $filtros["excluir_industrializado"];
    }
    if (str_contains($disturbios, "hipercolesterolemia")) {
        $condicoes[] = $filtros["lipideos_baixos"];
        $condicoes[] = $filtros["excluir_frito"];
        $condicoes[] = $filtros["excluir_industrializado"];
        $condicoes = array_merge($condicoes, $filtros["excluir_embutidos"]);
        $condicoes[] = "nome NOT LIKE '%queijo%'";
        $condicoes[] = "nome NOT LIKE '%manteiga%'";
    }
    if (str_contains($disturbios, "hipertensão")) {
        $condicoes[] = $filtros["sodio_baixo"];
        $condicoes[] = $filtros["excluir_frito"];
        $condicoes[] = $filtros["excluir_industrializado"];
        $condicoes = array_merge($condicoes, $filtros["excluir_embutidos"]);
        $condicoes[] = "nome NOT LIKE '%sal%'";
        $condicoes[] = "nome NOT LIKE '%salgado%'";
        $condicoes[] = "nome NOT LIKE '%conserva%'";
        $condicoes[] = "nome NOT LIKE '%caldo%'";
        $condicoes[] = "nome NOT LIKE '%tempero%'";
    }
    if (str_contains($disturbios, "sii")) {
        $condicoes = array_merge($condicoes, $filtros["excluir_lactose"]);
        $condicoes = array_merge($condicoes, $filtros["excluir_leguminosas"]);
        $condicoes = array_merge($condicoes, $filtros["excluir_vegetais_fermentaveis"]);
        $condicoes = array_merge($condicoes, $filtros["excluir_adocantes"]);
        $condicoes = array_merge($condicoes, $filtros["excluir_estimulantes"]);
        $condicoes[] = $filtros["excluir_frito"];
        $condicoes[] = "nome NOT LIKE '%embutido%'";
    }

    return $condicoes;
}
?>