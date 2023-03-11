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
    node_1.default.initialize(config_1.appId, config_1.appKey);
    node_1.default.liveQueryServerURL = config_1.wsUrl;
    const SignalList = node_1.default.Object.extend("TokenBuzzPro");
    let query = new node_1.default.Query(SignalList);
    let subscription = yield query.subscribe();
    yield db_1.sequelize.sync({ alter: true });
    subscription.on('open', () => {
        logger_1.default.info('subscription opened');
    });
    subscription.on('close', (error) => {
        logger_1.default.error(error);
    });
    subscription.on('create', (object) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(JSON.stringify(object));
        logger_1.default.warning("New Trade Signal Recd " + data.name);
        logger_1.default.warning("New Trade Signal Recd " + data.tokenAddress);
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
                .get(`https://api.bscscan.com/api?module=contract&action=getabi&address=${data.tokenAddress}&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG`)
                .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                let honeyPot = (0, tradeservice_1.checkAbiHoneyPot)(response.data.result);
                logger_1.default.info('Passed Token Address ' + data.tokenAddress);
                logger_1.default.info('Passed Token Verification Check ' + response.data.message);
                logger_1.default.info('Passed HoneyPot Check ' + !honeyPot);
                logger_1.default.info('Passed buyTax Check ' + buyTax);
                logger_1.default.info('Passed sellTax Check ' + sellTax);
                logger_1.default.info('Passed LiQuidity Check ' + data.lpUsdValue);
                if (!honeyPot && Number(buyTax) <= 20 && Number(sellTax) <= 20 && buyGas > 0 && sellGas > 0 && response.data.message === 'OK') {
                    const tradex = db_1.default.build(data);
                    yield tradex.save();
                    try {
                        const quoteinUsd = yield (0, tradeservice_1.getPairDetails)(data.tokenAddress);
                        logger_1.default.info('    QUOTE For  ' + data.name + ' is ' + +quoteinUsd);
                        if (quoteinUsd != null) {
                            const order = new orderbookingservice_1.default(data.tokenAddress);
                            yield order.startBooking();
                            const trades = yield db_1.default.findOne({
                                where: {
                                    buyAtTime: null,
                                    tokenAddress: data.tokenAddress
                                }
                            });
                            trades.update({ buyAtTime: new Date(), buyAtPrice: quoteinUsd, profit: 0.0 });
                        }
                    }
                    catch (error) {
                        logger_1.default.error("ERROR PLACING TRADE " + error.message);
                    }
                }
            }))
                .catch((err) => {
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
