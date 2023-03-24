import Web3 from 'web3'
import { RPC_BSC } from '../../config'
import { providers } from 'ethers';
 
const getWeb3 = () => { 
 
  return new Web3(RPC_BSC)
}

export default getWeb3