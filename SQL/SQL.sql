CREATE DATABASE IF NOT EXISTS dietase_db;
USE dietase_db;

CREATE TABLE perguntas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pergunta1_objetivo ENUM('perder', 'ganhar', 'manter', 'massa') NOT NULL,
    pergunta2_contagem_calorica ENUM('sim', 'nao') NOT NULL,
    pergunta3_jejum_intermitente ENUM('sim', 'nao') NOT NULL,
    pergunta4_nivel_atividade ENUM('sedentario', 'baixo', 'medio', 'alto') NOT NULL,
    pergunta6_tipo_dieta ENUM('low_carb', 'cetogenica', 'mediterranea', 'vegana', 'vegetariana', 'paleolitica', 'dieta_das_zonas') NOT NULL,
    pergunta7_comer_fds ENUM('sim', 'nao') NOT NULL,
    pergunta8_disturbios VARCHAR(400) NOT NULL,
    pergunta9_possui_dieta ENUM('sim', 'nao') NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE pergunta5_meta (
    id BIGINT NOT NULL AUTO_INCREMENT,
    perguntas_id BIGINT NOT NULL,
    tipo_meta ENUM('perder', 'ganhar', 'manter', 'massa') NOT NULL,
    valor_desejado DECIMAL(4,1) DEFAULT NULL,
    faixa_recomendada VARCHAR(20) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (perguntas_id) REFERENCES perguntas(id)
);

CREATE TABLE usuarios (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(40) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    sexo_biologico ENUM('m', 'f') DEFAULT NULL,
    data_nascimento DATE DEFAULT NULL,
    altura TINYINT UNSIGNED DEFAULT NULL,
    peso_inicial DECIMAL(4, 1) DEFAULT NULL,
    imc_inicial DECIMAL(4, 1) DEFAULT NULL,
    peso DECIMAL(4, 1) DEFAULT NULL,
    imc DECIMAL(4, 1) DEFAULT NULL,
    perguntas_id BIGINT DEFAULT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    FOREIGN KEY (perguntas_id) REFERENCES perguntas(id)
);

CREATE TABLE calorias (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    data_registro DATE NOT NULL,
    passos INT DEFAULT 0,
    calorias_gastas DECIMAL(6,2) DEFAULT 0,
    calorias_ingeridas DECIMAL(6,2) DEFAULT 0,
    saldo_calorico DECIMAL(6,2) DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE alimentos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(255),
    categoria VARCHAR(255),
    umidade_porcentagem VARCHAR(255),
    energia_kcal VARCHAR(255),
    proteina_g VARCHAR(255),
    lipideos_g VARCHAR(255),
    colesterol_g VARCHAR(255),
    carboidrato_g VARCHAR(255),
    fibra_g VARCHAR(255),
    cinzas_g VARCHAR(255),
    calcio_g VARCHAR(255),
    magnesio_g VARCHAR(255),
    manganês_mg VARCHAR(255),
    fosforo_mg VARCHAR(255),
    ferro_mg VARCHAR(255),
    sodio_mg VARCHAR(255),
    potassio_mg VARCHAR(255),
    cobre_mg VARCHAR(255),
    zinco_mg VARCHAR(255),
    retinol_mcg VARCHAR(255),
    re_mcg VARCHAR(255),
    rae_mcg VARCHAR(255),
    tiamina_mg VARCHAR(255),
    riboflavina_mg VARCHAR(255),
    piridoxina_mg VARCHAR(255),
    niacina_mg VARCHAR(255),
    vitamina_c_mg VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE alimentos_permitidos (
    usuario_id BIGINT NOT NULL,
    alimento_id BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, alimento_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (alimento_id) REFERENCES alimentos(id) ON DELETE CASCADE
);

CREATE TABLE dieta (
    usuario_id BIGINT NOT NULL,
    alimento_id BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, alimento_id),
    FOREIGN KEY (usuario_id, alimento_id) REFERENCES alimentos_permitidos(usuario_id, alimento_id) ON DELETE CASCADE
);

CREATE TABLE refeicoes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    data_registro DATE NOT NULL,
    tipo_refeicao ENUM('cafe', 'almoco', 'janta', 'lanche') NOT NULL,
    sintoma ENUM('nenhum', 'azia', 'enjoo', 'diarreia', 'dor_estomago') NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE refeicoes_alimento (
    refeicao_id BIGINT NOT NULL,
    alimento_id BIGINT NOT NULL,
    PRIMARY KEY (refeicao_id, alimento_id),
    FOREIGN KEY (refeicao_id) REFERENCES refeicoes(id) ON DELETE CASCADE,
    FOREIGN KEY (alimento_id) REFERENCES alimentos(id)
);

-- SELECT * FROM perguntas;
-- SELECT * FROM pergunta5_meta;
-- SELECT * FROM usuarios;
-- SELECT * FROM calorias;
-- SELECT * FROM alimentos;
-- SELECT * FROM alimentos_permitidos;
-- SELECT * FROM refeicoes;
-- SELECT * FROM refeicao_alimento;

-- DROP DATABASE dietase_db;