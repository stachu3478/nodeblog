This is a simple node.js + express + MySQL based site with article and account system.

## Setting up the server (requires MySQL installed):

### Setting up database:
	
Run:

<code>prepareMysql.js</code> as a server to set up database for accounts and articles.
	
OR using MongoDB:

<code>prepareDatabase.js</code> as a server to set up database for accounts and articles.
	
Note that MongoDB is not supported since MySQL has been implemented.
		
### Setting up a verification e-mail service:
	
1. Add file <code>ePassword.txt</code> in the main directory.
2. Put there your password.
	
### Running server:
		
cmd - > <code>server.js</code>
		
OR with user-defined salt in hashing database passwords:
	
cmd - > server.js -leftsalt <code>your left salt</code> -rightsalt <code>your right salt</code>

## Some additional features:

### IOTA crypto currency devnet operations:
	
iota/