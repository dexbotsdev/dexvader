import Web3 from "web3";
import {honeyPotAbi} from "./hp";

export default class HoneypotCheckerCaller {
  web3: Web3;
  gasLimit: number;
  gasPrice: any;
  value: any;
  honeypotCheckerContract: any;

  constructor(web3: Web3, checkerContract: string) {
    this.web3 = web3;

    /**
     * always use
     * 4000000 GAS LIMIT,
     * 10 gwei gasPrice,
     * 1 BNB Value
     * for simulation
     */
    this.gasLimit = 4000000;
    this.gasPrice = this.web3.utils.toWei("10", "gwei");
    this.value = this.web3.utils.toWei("1");

    this.honeypotCheckerContract = new web3.eth.Contract(
      honeyPotAbi as any,
      checkerContract
    );

    
  }

  async check(routerAddress: string, path: any[]) {
    try{
      const result = await this.honeypotCheckerContract.methods
      .check(routerAddress, path)
      .call({
        value: this.value,
        gasLimit: this.gasLimit,
        gasPrice: this.gasPrice,  
      });

    return result;
    }catch(error){

 
      return {
        buyGas:-1,
        sellGas:-1,
        estimatedBuy:-1,
        exactBuy:-1,
        estimatedSell:-1,
        exactSell:-1,
      }

    }
    
  }

  calculateTaxFee(estimatedPrice: number, exactPrice: number) {
    return (((estimatedPrice - exactPrice) / estimatedPrice) * 100).toFixed(1);
  }
};
