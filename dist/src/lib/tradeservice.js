"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.checkAbiHoneyPot = exports.getPairDetails = exports.getQuote = exports.getContract = exports.checkHoneyPot = exports.honeypotCheckerCaller = void 0;
const ethers_1 = __importStar(require("ethers"));
const config_1 = require("../../config");
const erc20_1 = require("./erc20");
const axios_1 = __importDefault(require("axios"));
const HoneypotCheckerCaller_1 = __importDefault(require("./HoneypotCheckerCaller"));
const web3_1 = __importDefault(require("./web3"));
const provider = new ethers_1.providers.WebSocketProvider(config_1.rpc_wss);
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
    let tokenContract = new ethers_1.default.Contract(tokenAddress, erc20_1.ERC20_ABI, provider);
    return tokenContract;
};
exports.getContract = getContract;
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
    var str = JSON.stringify(abi).toLowerCase();
    const isAccounting = str.indexOf('setAccounting') > 0 || str.indexOf('setaccounting') > 0;
    if (isAccounting)
        return true;
    return false;
};
exports.checkAbiHoneyPot = checkAbiHoneyPot;
