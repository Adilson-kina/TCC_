CREATE DATABASE IF NOT EXISTS dietase_db;
USE dietase_db;

CREATE TABLE perfis(
    id bigint NOT NULL AUTO_INCREMENT,
    pergunta1_objetivo enum('perder', 'ganhar', 'manter') NOT NULL,
    pergunta2_desafio enum('desafio1', 'desafio2', 'desafio3') NOT NULL,
    pergunta3_contagem_calorica enum('sim', 'nao') NOT NULL,
    pergunta4_jejum_intermitente enum('sim', 'nao') NOT NULL,
    pergunta5_atingir_objetivo varchar(255) NOT NULL, 
    pergunta9_nivel_atividade enum('baixo', 'medio', 'alto') NOT NULL,
    pergunta11_meta enum('meta1', 'meta2', 'meta3', 'meta4', 'meta5') NOT NULL,
    pergunta12_evento enum('sim', 'nao') NOT NULL,
    pergunta13_tipo_dieta enum('low_carb', 'cetogenica', 'mediterranea', 'vegana', 'vegetariana', 'paleolitica', 'dieta_das_zonas') NOT NULL,
    pergunta14_comer_fds enum('sim', 'nao') NOT NULL,
    pergunta15_disturbios varchar(255) NOT NULL,
    pergunta16_forma_avaliacao varchar(255) NOT NULL,
    pergunta17_possui_dieta enum('sim', 'nao') NOT NULL,
    perfil_final enum('perfil1', 'perfil2', 'perfil3', 'perfil4') NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE usuarios(
	id bigint NOT NULL AUTO_INCREMENT,
    nome varchar(40) NOT NULL,
    email varchar(40) NOT NULL UNIQUE,
    senha varchar(255) NOT NULL,
    sexo_biologico enum('m', 'f') DEFAULT NULL,
    data_nascimento date DEFAULT NULL,
    altura int(3) DEFAULT NULL, 
    peso decimal(4,1) DEFAULT NULL,
    medida_cintura DECIMAL(5,2) DEFAULT NULL,
    medida_quadril DECIMAL(5,2) DEFAULT NULL,
    medida_peito DECIMAL(5,2) DEFAULT NULL,
    perfil_id bigint DEFAULT NULL,
    ativo enum('true', 'false') NOT NULL,
    
    PRIMARY KEY (id),
    FOREIGN KEY (perfil_id) REFERENCES perfis(id)
);

-- SELECT * FROM usuarios;
-- DROP TABLE usuarios;

-- SELECT * FROM perfis;
-- DROP TABLE perfis;

-- DROP DATABASE dietase_db;