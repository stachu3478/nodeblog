INSERT INTO accounts
(username, password, permLevel, email, activationCode, resetPwdCode, accountCreation)
VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE())