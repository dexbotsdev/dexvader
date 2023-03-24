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
const node_1 = __importDefault(require("parse/node"));
const config_1 = require("../config");
const tradeservice_1 = require("./lib/tradeservice");
const db_1 = __importStar(require("./lib/db"));
const logger_1 = __importDefault(require("./lib/logger"));
const orderbookingservice_1 = __importDefault(require("./lib/orderbookingservice"));
const axios_1 = __importDefault(require("axios"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info('Starting the DexVader Job ');
    node_1.default.initialize(config_1.appId, config_1.appKey);
    node_1.default.liveQueryServerURL = config_1.wsUrl;
    const SignalList = node_1.default.Object.extend("TokenBuzzPro");
    let query = new node_1.default.Query(SignalList);
    let subscription = yield query.subscribe();
    logger_1.default.info('Starting subscription to DexVader Job ');
    subscription.on('open', () => {
        logger_1.default.info('subscription opened');
        db_1.sequelize.sync({ alter: true }).then((res) => res).catch((error) => {
            logger_1.default.error(error);
        });
    });
    subscription.on('close', (error) => {
        logger_1.default.error(error);
        main();
    });
    subscription.on('create', (object) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(JSON.stringify(object));
        logger_1.default.warning("New Trade Signal Recd " + data.name);
        logger_1.default.warning("New Trade Signal Recd " + data.tokenAddress);
        logger_1.default.warning("New Trade Signal LPUSD Value " + data.lpUsdValue);
        logger_1.default.warning("System Check LPUSD Value " + config_1.liquidityBarrier);
        if (Number(data.lpUsdValue) > config_1.liquidityBarrier) {
            logger_1.default.docs('Liquidity Check Passed ' + data.lpUsdValue);
            const { buyGas, sellGas, estimatedBuy, exactBuy, estimatedSell, exactSell, } = yield (0, tradeservice_1.checkHoneyPot)(data.tokenAddress);
            const [buyTax, sellTax] = [
                tradeservice_1.honeypotCheckerCaller.calculateTaxFee(estimatedBuy, exactBuy),
                tradeservice_1.honeypotCheckerCaller.calculateTaxFee(estimatedSell, exactSell),
            ];
            logger_1.default.docs('buyTax Check Passed ' + buyTax);
            logger_1.default.docs('sellTax Check Passed ' + sellTax);
            yield axios_1.default
                .get(`https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${data.tokenAddress}&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG`)
                .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                let honeyPot = (0, tradeservice_1.checkAbiHoneyPot)(response.data.result[0].ABI);
                let shitpot = (0, tradeservice_1.checkSrcHoneyPot)(response.data.result[0].SourceCode);
                logger_1.default.info('Passed Token Address ' + data.tokenAddress);
                logger_1.default.info('Passed Token Verification Check ' + response.data.message);
                logger_1.default.info('Passed HoneyPot Check L1 ' + !honeyPot);
                logger_1.default.info('Passed HoneyPot Check L2 ' + !shitpot);
                logger_1.default.info('Passed Max buyTax Check ' + buyTax);
                logger_1.default.info('Passed Max sellTax Check ' + sellTax);
                logger_1.default.info('Passed Min LiQuidity Check ' + data.lpUsdValue + ":" + config_1.liquidityBarrier);
                if (!honeyPot && !shitpot && Number(buyTax) <= config_1.maxBuyTaxAllowed && Number(sellTax) <= config_1.maxSellTaxAllowed && Number(buyTax) >= 0 && Number(sellTax) >= 0 && response.data.message === 'OK') {
                    logger_1.default.info('Saving first Initial Data ');
                    const tradex = db_1.default.build(data);
                    yield tradex.save();
                    logger_1.default.info('Saved Initial Data Commencing Trade ');
                    try {
                        let pairBNBPrice = 0;
                        const dexscreener = yield axios_1.default
                            .get(`https://api.dexscreener.com/latest/dex/tokens/${data.tokenAddress}`)
                            .then((res) => res)
                            .catch((err) => null);
                        if (dexscreener.data.pairs !== null) {
                            const plist = JSON.parse(JSON.stringify(dexscreener.data.pairs));
                            plist.map((item) => {
                                if (item.quoteToken.symbol === 'WBNB')
                                    pairBNBPrice = item.priceNative;
                            });
                        }
                        if (pairBNBPrice === 0) {
                            logger_1.default.error(' Token is not Paired with WBNB');
                        }
                        else
                            yield (0, tradeservice_1.buyToken)(data.tokenAddress, data.name).then((recpt) => __awaiter(void 0, void 0, void 0, function* () {
                                let quoteInBNB = Number(yield (0, tradeservice_1.getTokenPrice)(config_1.wbnbAddress, data.tokenAddress));
                                logger_1.default.error("Current Price of Token in BNB " + quoteInBNB);
                                if (recpt !== null) {
                                    const order = new orderbookingservice_1.default(data.tokenAddress);
                                    yield order.startBooking();
                                    const quantity = Number((config_1.bnbToInvestPerToken / Number(quoteInBNB)).toFixed(4));
                                    const trades = yield db_1.default.findOne({
                                        where: {
                                            buyAtTime: null,
                                            tokenAddress: data.tokenAddress
                                        }
                                    });
                                    trades.update({ quantity: quantity, buyAtTime: new Date(), investment: config_1.bnbToInvestPerToken, buyAtPrice: quoteInBNB, profit: 0.0 });
                                }
                            })).catch((error) => {
                                console.log(data.tokenAddress);
                                logger_1.default.error("L1: ERROR PLACING TRADE " + new String(error));
                            });
                    }
                    catch (error) {
                        console.log(data.tokenAddress);
                        logger_1.default.error("L2 : ERROR PLACING TRADE " + new String(error));
                    }
                }
            }))
                .catch((err) => {
                console.log(err);
                logger_1.default.error('Token Not Verified so Skipped');
            });
        }
        else {
            logger_1.default.error("Criteria Not Met");
        }
    }));
    subscription.on('update', () => {
        logger_1.default.error('object updated');
    });
});
exports.default = main;
function getPrice(token, BUSD) {
    throw new Error('Function not implemented.');
}
