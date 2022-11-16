DROP DATABASE IF EXISTS pen01db;

CREATE DATABASE pen01db;

\c pen01db

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS analyses;

CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE companies (
    ticker VARCHAR(6) PRIMARY KEY,
    company_name text DEFAULT '',
    epsgrowth3y NUMERIC DEFAULT 0,
    epsgrowth5y NUMERIC DEFAULT 0,
    revenuesharegrowth5y NUMERIC DEFAULT 0,
    revenuegrowth5y NUMERIC DEFAULT 0,
    penormalizedannual NUMERIC DEFAULT 0,
    epsnormalizedannual NUMERIC DEFAULT 0,
    epsexclextraitemsttm NUMERIC DEFAULT 0,
    high52weekhigh NUMERIC DEFAULT 0,
    low52weeklow NUMERIC DEFAULT 0,
    dividendpershareannual NUMERIC DEFAULT 0,
    dividendspersharettm NUMERIC DEFAULT 0,
    revenuepersharettm NUMERIC DEFAULT 0,
    shareoutstanding NUMERIC DEFAULT 0,
    previousclose NUMERIC DEFAULT 0,
    growthrate NUMERIC DEFAULT 0,
    orderby NUMERIC DEFAULT 0,
    lastupdate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analyses (
    username VARCHAR(25) REFERENCES users ON DELETE CASCADE,
    ticker VARCHAR(6) REFERENCES companies ON DELETE CASCADE,
    PRIMARY KEY (username, ticker),
    epsgrowthnext5y TEXT DEFAULT '',
    highpenext5y TEXT DEFAULT '',
    lowpenext5y TEXT DEFAULT '',
    comment TEXT DEFAULT ''
);

INSERT INTO users
  (username, password, first_name, last_name, email, is_admin)
VALUES
('demo', '$2b$10$Pd85hn7TxSuwQxjOW1vOZOUHyvBZI7R1RFGDvS9rVqk1RThI5KDlK', 'Demosthenes', 'Pandionis', 'demo@demo.com', 'f'),
('admin', '$2b$10$Pd85hn7TxSuwQxjOW1vOZOUHyvBZI7R1RFGDvS9rVqk1RThI5KDlK', 'Diacheiristis', 'Theadmin', 'admin@admin.com', 't');

INSERT INTO companies
  VALUES
('AAPL'),
('MSFT'),
('AMZN'),
('TSLA'),
('GOOG');

INSERT INTO analyses
  (username, ticker, epsGrowthNext5Y, highPeNext5Y, lowPeNext5Y, comment)
VALUES
('demo', 'AAPL', 5, 20, 5, 'Notes about AAPL'),
('demo', 'MSFT', 18, 40, 15, 'Notes about MSFT'),
('demo', 'AMZN', 20, 60, 20, 'Notes about AMZN'),
('demo', 'TSLA', 4, 30, 10, 'Notes about TSLA');
