const Iota = require('@iota/core')
const Converter = require('@iota/converter')

const iota = Iota.composeAPI({
    provider: 'https://nodes.devnet.iota.org:443'
    })

iota.getNodeInfo()
    .then(info => console.log(info))
    .catch(err => {})

const address = 'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD'

console.log('Searching for transations with ' + address);

iota
   .findTransactions({ addresses: [address] })
   .then(hashes => {
       // ...
	   console.log('There are ' + hashes.length + ' transactions. Printing the first 10 of them:');
	   console.log(hashes.slice(0,10))
	   iota.getTransactionObjects([hashes[0]]).then((arr) => console.log('This is the last transaction object: ', arr[0]));
   })
   .catch(err => {
       throw err;
   })
