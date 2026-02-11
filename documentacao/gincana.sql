-- =========================================
-- TABELA: equipe
-- id = série da turma
-- =========================================
CREATE TABLE equipe (
    id VARCHAR(20) PRIMARY KEY, -- Ex: 1A, 2B, 3C
    nome_lider VARCHAR(100) NOT NULL,
    nome_vice VARCHAR(100) NOT NULL,
    cor VARCHAR(50) NOT NULL,
    quantidade_alunos INT NOT NULL
);

-- =========================================
-- TABELA: pessoa
-- =========================================
CREATE TABLE pessoa (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- =========================================
-- TABELA: cargo
-- representante | professor | aluno
-- =========================================
CREATE TABLE cargo (
    id SERIAL PRIMARY KEY,
    pessoa_id INT NOT NULL,
    cargo VARCHAR(50) NOT NULL,
    FOREIGN KEY (pessoa_id) REFERENCES pessoa(id)
);

-- =========================================
-- TABELA: programacao (organiza por dia)
-- =========================================
CREATE TABLE programacao (
    id SERIAL PRIMARY KEY,
    dia VARCHAR(20) NOT NULL, -- Segunda, Terça...
    descricao TEXT NOT NULL
);

-- =========================================
-- TABELA: prova
-- =========================================
CREATE TABLE prova (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(100), -- Esportiva, Filantrópica, Cultural
    dia VARCHAR(20) NOT NULL
);

-- =========================================
-- TABELA: resultado
-- Sempre tem equipe_id
-- =========================================
CREATE TABLE resultado (
    id SERIAL PRIMARY KEY,
    prova_id INT NOT NULL,
    equipe_id VARCHAR(20) NOT NULL,
    colocacao INT, -- 1, 2, 3
    pontos INT NOT NULL,
    FOREIGN KEY (prova_id) REFERENCES prova(id),
    FOREIGN KEY (equipe_id) REFERENCES equipe(id)
);

-- =========================================
-- TABELA: produtos (filantrópicos)
-- =========================================
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    unidade VARCHAR(100) NOT NULL,
    pontos INT NOT NULL
);

-- =========================================
-- TABELA: doacao_produto
-- Pontuação por equipe
-- =========================================
CREATE TABLE doacao_produto (
    id SERIAL PRIMARY KEY,
    equipe_id VARCHAR(20) NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    pontos_total INT NOT NULL,
    FOREIGN KEY (equipe_id) REFERENCES equipe(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
-- =========================================
-- INSERTS EQUIPE
-- =========================================
INSERT INTO equipe (id, nome_lider, nome_vice, cor, quantidade_alunos) VALUES
('1A', 'Ana', 'Carlos', 'Azul', 25),
('2B', 'Maria', 'João', 'Vermelho', 30),
('3C', 'Lucas', 'Fernanda', 'Verde', 28),
('4D', 'Beatriz', 'Rafael', 'Amarelo', 27);

-- =========================================
-- INSERTS PESSOA
-- =========================================
INSERT INTO pessoa (nome, email, senha) VALUES
('Emilly', 'emilly@email.com', '123456'),
('Professor João', 'prof@email.com', '123456'),
('Ana', 'ana@email.com', '123456'),
('Maria', 'maria@email.com', '123456');

-- =========================================
-- INSERTS CARGO
-- =========================================
INSERT INTO cargo (pessoa_id, cargo) VALUES
(1, 'representante'),
(2, 'professor'),
(3, 'aluno'),
(4, 'aluno');

-- =========================================
-- INSERTS PROGRAMAÇÃO
-- =========================================
INSERT INTO programacao (dia, descricao) VALUES
('Segunda', 'Provas Filantrópicas'),
('Terça', 'Provas Esportivas'),
('Quarta', 'Provas Culturais'),
('Quinta', 'Brincadeiras e Recreativas'),
('Sexta', 'Resultado Final');

-- =========================================
-- INSERTS PROVAS
-- =========================================
INSERT INTO prova (nome, categoria, dia) VALUES
('Sangue', 'Filantrópica', 'Segunda'),
('Medula', 'Filantrópica', 'Segunda'),
('Alimentos', 'Filantrópica', 'Segunda'),
('Futsal Masculino', 'Esportiva', 'Terça'),
('Futsal Feminino', 'Esportiva', 'Terça'),
('Vôlei', 'Esportiva', 'Terça'),
('Dança', 'Cultural', 'Quarta'),
('Música', 'Cultural', 'Quarta'),
('Cosplay', 'Cultural', 'Quarta'),
('Prova Relâmpago', 'Recreativa', 'Quinta'),
('Prova do Bolo', 'Recreativa', 'Quinta'),
('Perguntas', 'Recreativa', 'Quinta');

-- =========================================
-- INSERTS RESULTADOS
-- =========================================
INSERT INTO resultado (prova_id, equipe_id, colocacao, pontos) VALUES
(1, '1A', 1, 100),
(1, '2B', 2, 80),
(1, '3C', 3, 60),
(4, '2B', 1, 120),
(4, '1A', 2, 90),
(7, '3C', 1, 110);

-- =========================================
-- INSERTS PRODUTOS
-- =========================================
INSERT INTO produtos (descricao, unidade, pontos) VALUES
('Arroz', '1 kg', 8),
('Açúcar', '1 kg', 3),
('Café', '500 g', 10),
('Macarrão', '500 g', 3),
('Farinha de Trigo', '1 kg', 3),
('Feijão', '1 kg', 8),
('Sal', '1 kg', 2),
('Óleo de cozinha', '900 ml', 5),
('Massa / Molho / Extrato de tomate', '340 g', 3),
('Leite Longa Vida ou Leite em Pó', '1 litro ou pacote de 200 g', 3),
('Água de coco', '1 litro', 8),
('Fubá / Polenta / Farofa / Farinha de Biju', '500 g', 2),
('Biscoito (doces ou salgados)', '1 pacote (mínimo 100 g)', 3),
('Ração (cachorro ou gato)', '1 kg', 6),
('Papel higiênico', '4 rolos', 4),
('Conservas em geral', '1 unidade', 3),
('Alimentos fora da lista', '1 unidade', 3),
('Creme dental', '1 unidade', 3),
('Sabonete', '1 unidade', 2),
('Detergente líquido', '500 ml', 3),
('Sabão (barra)', '5 unidades industrial', 7),
('Escova de dente', '1 unidade', 1),
('Sabão em pó', '500 g', 5);

-- =========================================
-- INSERTS DOAÇÃO PRODUTO
-- =========================================
INSERT INTO doacao_produto (equipe_id, produto_id, quantidade, pontos_total) VALUES
('1A', 1, 10, 80),
('2B', 2, 20, 60),
('3C', 3, 5, 50),
('4D', 4, 15, 45);
