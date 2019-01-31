SELECT articles.*, accounts.* FROM accounts INNER JOIN articles
ON accounts._id = articles.authorId;