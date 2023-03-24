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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sellToken = exports.buyToken = exports.checkSrcHoneyPot = exports.checkAbiHoneyPot = exports.getPairDetails = exports.getQuote = exports.getTokenPrice = exports.getContract = exports.checkHoneyPot = exports.honeypotCheckerCaller = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../../config");
const erc20_1 = require("./erc20");
const PancakeRouterABI_1 = require("./abi/PancakeRouterABI");
const axios_1 = __importDefault(require("axios"));
const HoneypotCheckerCaller_1 = __importDefault(require("./HoneypotCheckerCaller"));
const web3_1 = __importDefault(require("./web3"));
const wbnbABI_1 = require("./abi/wbnbABI");
const provider = new ethers_1.providers.JsonRpcProvider(config_1.RPC_BSC);
const wallet = new ethers_1.Wallet(config_1.privateKey, provider);
const signer = wallet.connect(provider);
const router = new ethers_1.Contract(config_1.routerAddress, PancakeRouterABI_1.PancakeRouterABI, signer);
const web3 = (0, web3_1.default)();
exports.honeypotCheckerCaller = new HoneypotCheckerCaller_1.default(web3, config_1.honeyCheckAddress);
const checkHoneyPot = (tokenAddress) => __awaiter(void 0, void 0, void 0, function* () {
    return yield exports.honeypotCheckerCaller.check(config_1.routerAddress, [
        config_1.wbnbAddress,
        tokenAddress,
    ]);
});
exports.checkHoneyPot = checkHoneyPot;
const getContract = (tokenAddress) => {
    let tokenContract = new ethers_1.Contract(tokenAddress, erc20_1.ERC20_ABI, provider);
    return tokenContract;
};
exports.getContract = getContract;
const getTokenPrice = (inputCurrency, outputCurrency) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tokenContract = new ethers_1.Contract(outputCurrency, erc20_1.ERC20_ABI, signer);
        const decimalsdest = yield tokenContract.decimals();
        const amounts = yield router.getAmountsOut(ethers_1.utils.parseUnits("1", decimalsdest), [outputCurrency, inputCurrency]);
        console.log(' Amounts in getTokenPrice for ' + ":" + outputCurrency);
        console.log(ethers_1.utils.formatUnits(amounts[1].toString(), 18));
        return ethers_1.utils.formatUnits(amounts[1].toString(), 18);
    }
    catch (error) {
        console.log(outputCurrency);
        console.log(error);
    }
});
exports.getTokenPrice = getTokenPrice;
const getQuote = (pairAddress) => __awaiter(void 0, void 0, void 0, function* () {
    return yield axios_1.default.get("https://api.dexscreener.com/latest/dex/pairs/bsc/" + pairAddress);
});
exports.getQuote = getQuote;
const getPairDetails = (tokenAddress) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const contractdata = yield axios_1.default
        .get(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`)
        .then(res => res)
        .catch(error => null);
    return (_b = (_a = contractdata === null || contractdata === void 0 ? void 0 : contractdata.data) === null || _a === void 0 ? void 0 : _a.pairs[0]) === null || _b === void 0 ? void 0 : _b.priceUsd;
});
exports.getPairDetails = getPairDetails;
const checkAbiHoneyPot = (abi) => {
    var str = JSON.stringify(abi);
    const isAccounting = str.indexOf('setaccounting') > 0 || str.indexOf('upgradetoandcall') > 0;
    if (isAccounting)
        return true;
    return false;
};
exports.checkAbiHoneyPot = checkAbiHoneyPot;
const checkSrcHoneyPot = (abi) => {
    var str = JSON.stringify(abi);
    const isHiddenShit = str.indexOf('erc20Transfer') > 0 || str.indexOf('withdraw') > 0 || str.indexOf('erc20Approve') > 0;
    if (isHiddenShit)
        return true;
    return false;
};
exports.checkSrcHoneyPot = checkSrcHoneyPot;
const buyToken = (tokenAddress, tokenName) => __awaiter(void 0, void 0, void 0, function* () {
    if (config_1.demoEnabled)
        return 'newRecpt';
    let amountOutMin = 0;
    //We buy x amount of the new token for our wbnb
    const amountIn = ethers_1.utils.parseUnits(config_1.bnbToInvestPerToken.toString(), 'ether');
    let tokenContract = new ethers_1.Contract(tokenAddress, erc20_1.ERC20_ABI, signer);
    const decimalsdest = yield tokenContract.decimals();
    const nonce = (yield provider.getTransactionCount(wallet.address)) + 1;
    const WBNB = new ethers_1.Contract(config_1.wbnbAddress, wbnbABI_1.WBNB_ABI, signer);
    ethers_1.logger.info('nonce   ' + nonce);
    ethers_1.logger.info('Approving   ');
    yield WBNB.approve(config_1.routerAddress, config_1.MAX).then((res) => {
        console.log(res);
    }).catch((error) => {
        console.log(tokenAddress);
        console.log(error);
    });
    if (config_1.slippage !== 0) {
        const amounts = yield router.getAmountsOut(amountIn, [config_1.wbnbAddress, tokenAddress]);
        amountOutMin = amounts[1].sub(amounts[1].div(`${config_1.slippage}`));
    }
    console.log(`Buying Token
     =================
     tokenIn: ${((ethers_1.utils.formatUnits(amountIn, 18))).toString()}   (BNB)
     tokenOut: ${Number(ethers_1.utils.formatUnits(amountOutMin, decimalsdest)).toFixed(2)}  ${tokenName}
   `);
    ethers_1.logger.info('Buying Token ' + tokenAddress);
    const tx = yield router.swapExactTokensForTokensSupportingFeeOnTransferTokens(//uncomment here if you want to buy token
    amountIn, amountOutMin, [config_1.wbnbAddress, tokenAddress], wallet.address, Date.now() + 1000 * 1, //5 minutes
    {
        'gasLimit': config_1.gasLimit,
        'gasPrice': ethers_1.utils.parseUnits(config_1.gasPrice, 'gwei'),
    });
    const receipt = yield tx.wait();
    console.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[1].transactionHash}`);
    return receipt;
});
exports.buyToken = buyToken;
const sellToken = (tokenAddress) => __awaiter(void 0, void 0, void 0, function* () {
    if (config_1.demoEnabled)
        return 'newRecpt';
    let amountOutMin = 0;
    //We sell x amount of the new token for our wbnb
    let tokenContract = new ethers_1.Contract(tokenAddress, erc20_1.ERC20_ABI, signer);
    const decimalsdest = yield tokenContract.decimals();
    const nonce = (yield provider.getTransactionCount(wallet.address)) + 1;
    const amountIn = yield tokenContract.balanceOf(wallet.address);
    ethers_1.logger.info('nonce   ' + nonce);
    ethers_1.logger.info('Approving   ');
    yield tokenContract.approve(config_1.routerAddress, config_1.MAX).then((res) => {
        console.log(res);
    }).catch((error) => {
        console.log(error);
    });
    if (config_1.slippage !== 0) {
        const amounts = yield router.getAmountsOut(amountIn, [tokenAddress, config_1.wbnbAddress]);
        amountOutMin = amounts[1].sub(amounts[1].div(`${config_1.slippage}`));
    }
    console.log(`Buying Token
     =================
     tokenIn: ${((ethers_1.utils.formatUnits(amountIn, 18))).toString()}   (WBNB)
     tokenOut: ${Number(ethers_1.utils.formatUnits(amountOutMin, decimalsdest)).toFixed(2)}  
   `);
    ethers_1.logger.info('Selling Token ' + tokenAddress);
    const tx = yield router.swapExactTokensForTokensSupportingFeeOnTransferTokens(//uncomment here if you want to buy token
    amountIn, amountOutMin, [tokenAddress, config_1.wbnbAddress], wallet.address, Date.now() + 1000 * 1, //5 minutes
    {
        'gasLimit': config_1.gasLimit,
        'gasPrice': ethers_1.utils.parseUnits(config_1.gasPrice, 'gwei'),
    });
    const receipt = yield tx.wait();
    console.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[1].transactionHash}`);
    return receipt;
});
exports.sellToken = sellToken;
