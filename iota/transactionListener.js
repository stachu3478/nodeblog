let zmq = require('zeromq')
let sock = zmq.socket('sub')
const Converter = require('@iota/converter')

sock.connect('tcp://zmq.devnet.iota.org:5556')
//sock.subscribe('tx')
//sock.subscribe('sn')
sock.subscribe('HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD')

sock.on('message', msg => {
  const data = msg.toString().split(' ') // Split to get topic & data
  switch (
    data[0] // Use index 0 to match topic
  ) {
	case 'HELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDHELLOWORLDD':
      console.log(`Transaction to HELLOWORLD...`, data)
      break
    case 'tx':
      console.log(`I'm a TX!`, data.slice(1))
      break
    case 'sn':
      console.log(`I'm a confirmed TX`, data.slice(1))
      break
  }
})