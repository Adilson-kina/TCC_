CREATE DATABASE IF NOT EXISTS dietase_db;
USE dietase_db;

CREATE TABLE perfis (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pergunta1_objetivo ENUM('perder', 'ganhar', 'manter') NOT NULL,
    pergunta2_desafio ENUM('desafio1', 'desafio2', 'desafio3') NOT NULL,
    pergunta3_contagem_calorica ENUM('sim', 'nao') NOT NULL,
    pergunta4_jejum_intermitente ENUM('sim', 'nao') NOT NULL,
    pergunta5_atingir_objetivo VARCHAR(255) NOT NULL,
    pergunta9_nivel_atividade ENUM('baixo', 'medio', 'alto') NOT NULL,
    pergunta11_meta ENUM('meta1', 'meta2', 'meta3', 'meta4', 'meta5') NOT NULL,
    pergunta12_evento ENUM('sim', 'nao') NOT NULL,
    pergunta13_tipo_dieta ENUM('low_carb', 'cetogenica', 'mediterranea', 'vegana', 'vegetariana', 'paleolitica', 'dieta_das_zonas') NOT NULL,
    pergunta14_comer_fds ENUM('sim', 'nao') NOT NULL,
    pergunta15_disturbios VARCHAR(255) NOT NULL,
    pergunta16_forma_avaliacao VARCHAR(255) NOT NULL,
    pergunta17_possui_dieta ENUM('sim', 'nao') NOT NULL,
    perfil_final ENUM('perfil1', 'perfil2', 'perfil3', 'perfil4') NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE usuarios (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(40) NOT NULL,
    email VARCHAR(40) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    sexo_biologico ENUM('m', 'f') DEFAULT NULL,
    data_nascimento DATE DEFAULT NULL,
    altura TINYINT UNSIGNED DEFAULT NULL,
    peso_inicial DECIMAL(4,1) DEFAULT NULL,
    imc_inicial DECIMAL(4,1) DEFAULT NULL,
    peso DECIMAL(4,1) DEFAULT NULL,
    imc DECIMAL(4,1) DEFAULT NULL,
    medida_cintura DECIMAL(5,2) DEFAULT NULL,
    medida_quadril DECIMAL(5,2) DEFAULT NULL,
    medida_peito DECIMAL(5,2) DEFAULT NULL,
    perfil_id BIGINT DEFAULT NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    FOREIGN KEY (perfil_id) REFERENCES perfis(id)
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
    nome VARCHAR(100) NOT NULL,
    calorias DECIMAL(6,2) NOT NULL,
    PRIMARY KEY (id)
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

CREATE TABLE refeicao_alimento (
    refeicao_id BIGINT NOT NULL,
    alimento_id BIGINT NOT NULL,
    PRIMARY KEY (refeicao_id, alimento_id),
    FOREIGN KEY (refeicao_id) REFERENCES refeicoes(id) ON DELETE CASCADE,
    FOREIGN KEY (alimento_id) REFERENCES alimentos(id)
);

-- SELECT * FROM perfis;
-- SELECT * FROM usuarios;
-- SELECT * FROM calorias;
-- SELECT * FROM alimentos;
-- SELECT * FROM refeicoes;
-- SELECT * FROM refeicao_alimento;

-- DROP DATABASE dietase_db;