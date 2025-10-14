CREATE DATABASE IF NOT EXISTS tcc_db;
USE tcc_db;

CREATE TABLE usuarios(
	id bigint not null auto_increment,
    nome varchar(40),
    email varchar(40) not null unique,
    senha varchar(255) not null,
    ativo enum('true', 'false') not null,
    
    primary key (id)
);

-- SELECT * FROM usuarios;
-- DROP TABLE usuarios;