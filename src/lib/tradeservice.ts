import ethers,{logger, providers,Wallet,Contract,utils}  from "ethers"; 
import Web3 from "web3";
import { rpc_wss,wbnbAddress,routerAddress,honeyCheckAddress, RPC_BSC, bnbToInvestPerToken, gasLimit, slippage, privateKey, MAX, gasPrice, demoEnabled } from "../../config";
import { ERC20_ABI } from "./erc20";
import { PancakeRouterABI } from "./abi/PancakeRouterABI";
 import axios from "axios"; 
import HoneypotCheckerCaller from "./HoneypotCheckerCaller"; 
import getWeb3 from "./web3";
import { WBNB_ABI } from './abi/wbnbABI';
const provider = new  providers.JsonRpcProvider(
  RPC_BSC
); 

const wallet = new Wallet(privateKey, provider); 
const signer = wallet.connect(provider);
const router = new Contract(
  routerAddress,
  PancakeRouterABI,
  signer
); 

const web3 = getWeb3();
export const honeypotCheckerCaller = new HoneypotCheckerCaller(
  web3,
  honeyCheckAddress
) 
export const checkHoneyPot= async (tokenAddress: any)=>{

  return await honeypotCheckerCaller.check(routerAddress, [
    wbnbAddress,
    tokenAddress,
  ]);
}

export const getContract = (tokenAddress: string)=>{
  let tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
  return tokenContract;
}
 

 

export const getTokenPrice   =async(inputCurrency: any,outputCurrency: any)=>{
try{
  let tokenContract = new Contract(outputCurrency, ERC20_ABI, signer);
  const decimalsdest = await tokenContract.decimals();

  const amounts = await router.getAmountsOut(utils.parseUnits("1", decimalsdest), [outputCurrency,inputCurrency]);

  console.log(' Amounts in getTokenPrice for '+":"+outputCurrency)
  console.log(utils.formatUnits(amounts[1].toString(),18));

  return utils.formatUnits(amounts[1].toString(),18);
}catch(error){
  console.log(outputCurrency)
  console.log(error)
}
}


export const getQuote = async(pairAddress: string)=>{
  return await axios.get("https://api.dexscreener.com/latest/dex/pairs/bsc/"+pairAddress);
   
 }

 export const getPairDetails = async(tokenAddress: any)=>{
  
    
  const contractdata= await axios
  .get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
  .then(res=>res)
  .catch(error=>null); 
   return contractdata?.data?.pairs[0]?.priceUsd;
 }


 export  const checkAbiHoneyPot =(abi: any)=>{
 
  var str = JSON.stringify(abi); 
  const isAccounting =  str.indexOf('setaccounting')>0 || str.indexOf('upgradetoandcall')>0; 
   if(isAccounting ) return true; 

  return false;

}

export  const checkSrcHoneyPot =(abi: any)=>{
 
  var str = JSON.stringify(abi); 
  const isHiddenShit =  str.indexOf('erc20Transfer')>0 || str.indexOf('withdraw')>0 || str.indexOf('erc20Approve')>0; 
   if(isHiddenShit ) return true; 

  return false;

}


export const buyToken= async(tokenAddress: string,tokenName: string)=>{

  if(demoEnabled)return 'newRecpt';

  let amountOutMin = 0;
  //We buy x amount of the new token for our wbnb
  const amountIn = utils.parseUnits(bnbToInvestPerToken.toString(), 'ether');
  let tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
  const decimalsdest = await tokenContract.decimals();
  const nonce = (await provider.getTransactionCount(wallet.address)) + 1

  const WBNB = new Contract(wbnbAddress, WBNB_ABI, signer);

  logger.info('nonce   '+ nonce)
  logger.info('Approving   ' )

  await WBNB.approve(routerAddress,MAX).then((res: any)=>{
    console.log(res)
  }).catch((error: any)=>{
    console.log(tokenAddress)

    console.log(error)
  })
  if (  slippage  !== 0 ){
    const amounts = await router.getAmountsOut(amountIn, [wbnbAddress, tokenAddress]); 
    amountOutMin = amounts[1].sub(amounts[1].div(`${slippage}`));
  }
  console.log( 
     `Buying Token
     =================
     tokenIn: ${((utils.formatUnits(amountIn,18))).toString()}   (BNB)
     tokenOut: ${Number(utils.formatUnits(amountOutMin,decimalsdest)).toFixed(2)}  ${tokenName}
   `);

   logger.info('Buying Token '+ tokenAddress)
   const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens( //uncomment here if you want to buy token
   amountIn,
   amountOutMin,
   [wbnbAddress, tokenAddress],
   wallet.address,
   Date.now() + 1000 * 1, //5 minutes
   { 
     'gasLimit': gasLimit,
     'gasPrice': utils.parseUnits(gasPrice, 'gwei'), 
 });
 

 const receipt = await tx.wait();
 console.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[1].transactionHash}`);

return receipt;



}
 

export const sellToken= async(tokenAddress: string)=>{

  if(demoEnabled)return 'newRecpt';

let amountOutMin = 0;
  //We sell x amount of the new token for our wbnb
  let tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);
  const decimalsdest = await tokenContract.decimals();
  const nonce = (await provider.getTransactionCount(wallet.address)) + 1
  const amountIn = await tokenContract.balanceOf(wallet.address);


  logger.info('nonce   '+ nonce)
  logger.info('Approving   ' )

  await tokenContract.approve(routerAddress,MAX).then((res: any)=>{
    console.log(res)
  }).catch((error: any)=>{
    console.log(error)
  })
  if ( slippage  !== 0 ){
    const amounts = await router.getAmountsOut(amountIn, [ tokenAddress,wbnbAddress]); 
    amountOutMin = amounts[1].sub(amounts[1].div(`${slippage}`));
  }
  console.log( 
     `Buying Token
     =================
     tokenIn: ${((utils.formatUnits(amountIn,18))).toString()}   (WBNB)
     tokenOut: ${Number(utils.formatUnits(amountOutMin,decimalsdest)).toFixed(2)}  
   `);

   logger.info('Selling Token '+ tokenAddress)
   const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens( //uncomment here if you want to buy token
   amountIn,
   amountOutMin,
   [tokenAddress,wbnbAddress],
   wallet.address,
   Date.now() + 1000 * 1, //5 minutes
   { 
     'gasLimit': gasLimit,
     'gasPrice': utils.parseUnits(gasPrice, 'gwei'), 
 });
 
 const receipt = await tx.wait();
 console.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[1].transactionHash}`);

return receipt;


}
