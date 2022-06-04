const Iota = require('@iota/core')
const Converter = require('@iota/converter')

const iota = Iota.composeAPI({
    provider: 'https://nodes.devnet.iota.org:443'
    })

iota.getNodeInfo()
    .then(info => console.log(info))
    .catch(err => {})

const seed2 = 'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'
const seed1 = 'PUEOTSEITFEVEWCWBTSIZM9NKRGJEIMXTULBACGFRQK9IMGICLBKW9TTEVSDQMGWKBXPVCBMMCXWMNPDX'
const message = '9LOREM9IPSUM9DOLOR9SIT9AMET'//iota.utils.toTrytes('Hello World!')

iota
   .getAccountData(seed1, {
    start: 100,
    security: 1
})
  .then(accountData => {
	console.log('My account balance is: ' + accountData.balance);
	console.log('I have already performed ' + accountData.transactions.length + ' transactions.');
	console.log('My addresses:');
	console.log(accountData.addresses);
	console.log('My inputs:');
	console.log(accountData.inputs.length);
	if(accountData.transactions.length > 0)
		console.log('Transaction: ', accountData.transactions[0])
    //const { addresses, inputs, transactions, balance } = accountData
    // ...
	const transfers = [
	  {
		value: 0,
		address: accountData.addresses[accountData.addresses.length],
		message: message
	  }
	]
	iota
	  .prepareTransfers(seed2, transfers)
	  .then(trytes => iota.sendTrytes(trytes, 3, 9))
	  .then(bundle => {
		console.log(bundle)
	  })
	  .catch(err => {
		  console.log(err);
		// catch any errors
	  })
  })
  .catch(err => {
    throw err;
  })