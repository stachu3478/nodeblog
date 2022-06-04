CREATE TABLE IF NOT EXISTS accounts (
	_id INT AUTO_INCREMENT PRIMARY KEY,

	username VARCHAR(24),
	password VARCHAR(56),
	
	email VARCHAR(56),
	
	verified BOOLEAN DEFAULT 0,
	activationLinkSent BOOLEAN DEFAULT 0,
	
	activationCode VARCHAR(32),
	resetPwdCode VARCHAR(32),
	
	resetPwdSent BOOLEAN DEFAULT 0,
	pwdMustChange BOOLEAN DEFAULT 0,
	pwdChange TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
	
	accountCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
	
	permLevel INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS articles (
	_id INT AUTO_INCREMENT PRIMARY KEY,
	authorId INT,
	
	title BLOB,
	text BLOB,
	
	publishDate DATE
);

INSERT INTO accounts (username, password, verified, resetPwdCode, permLevel)
VALUES ('admin', ?, 1, ?, 3);

INSERT INTO articles (title, text, publishDate, authorId)
VALUES ('Przykładowy artykuł', 'Artykuł, jaki powinien wyglądać żywcem wyciągnięty z bazy danych', '2019-01-01', 1);