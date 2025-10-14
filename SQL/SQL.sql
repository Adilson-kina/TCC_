CREATE DATABASE IF NOT EXISTS tcc_db;
USE tcc_db;

CREATE TABLE usuarios(
	id bigint NOT NULL auto_increment,
    nome varchar(40),
    email varchar(40) NOT NULL UNIQUE,
    senha varchar(255) NOT NULL,
    perfil varchar(20) DEFAULT NULL,
    sexo_biologico enum('m', 'f') DEFAULT NULL,
    data_nascimento date DEFAULT NULL,
    altura int(3) DEFAULT NULL, 
    peso DECIMAL(4,1) DEFAULT NULL,
    ativo enum('true', 'false') not null,
    
    primary key (id)
);

-- SELECT * FROM usuarios;
-- DROP TABLE usuarios;