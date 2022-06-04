const Iota = require('@iota/core')
const Converter = require('@iota/converter')

const iota = Iota.composeAPI({
    provider: 'https://nodes.devnet.iota.org:443'
    })

iota.getNodeInfo()
    .then(info => console.log(info))
    .catch(err => {})

const seed = 'PUEOTSEITFEVEWCWBTSIZM9NKRGJEIMXTULBACGFRQK9IMGICLBKW9TTEVSDQMGWKBXPVCBMMCXWMNPDX'
//const seed = 'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'

iota
   .getAccountData(seed, {
    start: 0,
    security: 1
})
  .then(accountData => {
	console.log('My account balance is: ' + accountData.balance);
	console.log('I have already performed ' + accountData.transactions.length + ' transactions.');
	console.log('My addresses:');
	console.log(accountData.addresses);
	console.log('My inputs:');
	console.log(accountData.inputs.length);
	if(accountData.transactions.length > 0){
		console.log('Transaction performed: ', accountData.transactions[2]);
		iota
			.getTransactionObjects([accountData.transactions[2]])
			.then((tran) => console.log(tran[0]))
	};
	if(accountData.inputs.length > 0){
		console.log('Transaction got: ', accountData.inputs[0]);
	};
    //const { addresses, inputs, transactions, balance } = accountData
    // ...
  })
  .catch(err => {
    throw err;
  })
