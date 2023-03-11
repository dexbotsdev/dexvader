 import { config } from "dotenv";
import { ethers } from "ethers";
 config();

export const appId="Z6R6NI8P6LR2ZIE0B9G1";
export const appKey="QCS13J3VY5P6C0SV9CXFW24P8CQQ3RS8EQCX3LHB";
export const wsUrl='ws://144.24.158.75:1337/parse';
export const httpUrl='ws://144.24.158.75:1337/parse';

export const rpc_wss='wss://bsc-mainnet.nodereal.io/ws/v1/ea49d5c625d34b069be219d151e4f1e8';
export const rpc_http='https://bsc-mainnet.nodereal.io/ws/v1/ea49d5c625d34b069be219d151e4f1e8';

export const routerAddress='0x10ed43c718714eb63d5aa57b78b54704e256024e';
export const factoryAddress='0xca143ce32fe78f1f7019d7d551a6402fc5350c73';
export const wbnbAddress='0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'; 
export const bnbAddress='0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'; 
export const busdAddress='0xe9e7cea3dedca5984780bafc599bd69add087d56';
export const honeyCheckAddress='0xcF8138eC606cD88C561A19F626EfCB25499DD95D';
export const RPC_BSC= "https://bsc-dataseed.binance.org/"

// BNB Liquidity Limit to validate before buying
export const liquidityBarrier=Number(process.env.liquidityBarrier); 
export const takeProfit=Number(process.env.takeProfit); 
export const stopLoss=Number(process.env.stopLoss); 
export const trailingstopLoss=Number(process.env.trailingstopLoss); 
export const gasLimit=Number(process.env.gasLimit);  
export const slippage=Number(process.env.slippage); 
export const delay=Number(process.env.delay); 
export const bnbToInvestPerToken= Number(process.env.bnbToInvestPerToken); 
export const  MAX = ethers.BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
export const gasPrice=process.env.gasPrice
export const privateKey=process.env.PRIVATEKEY
