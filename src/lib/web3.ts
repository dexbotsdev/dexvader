import Web3 from 'web3'
import { rpc_wss } from '../../config'
import { providers } from 'ethers';
 
const getWeb3 = () => { 
 
  return new Web3(rpc_wss)
}

export default getWeb3