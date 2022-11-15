DROP DATABASE IF EXISTS pen01db;

CREATE DATABASE pen01db;

\c pen01db

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT ''
);

INSERT INTO users
  (username)
VALUES
('demo'),
('admin');
