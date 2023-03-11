"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hp_1 = require("./hp");
class HoneypotCheckerCaller {
    constructor(web3, checkerContract) {
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
        this.honeypotCheckerContract = new web3.eth.Contract(hp_1.honeyPotAbi, checkerContract);
    }
    check(routerAddress, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.honeypotCheckerContract.methods
                    .check(routerAddress, path)
                    .call({
                    value: this.value,
                    gasLimit: this.gasLimit,
                    gasPrice: this.gasPrice,
                });
                return result;
            }
            catch (error) {
                return {
                    buyGas: -1,
                    sellGas: -1,
                    estimatedBuy: -1,
                    exactBuy: -1,
                    estimatedSell: -1,
                    exactSell: -1,
                };
            }
        });
    }
    calculateTaxFee(estimatedPrice, exactPrice) {
        return (((estimatedPrice - exactPrice) / estimatedPrice) * 100).toFixed(1);
    }
}
exports.default = HoneypotCheckerCaller;
;
