SELECT *
FROM accounts
WHERE email = ? OR username = ?
LIMIT 1