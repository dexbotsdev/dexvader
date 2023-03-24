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
const tradeservice_1 = require("./tradeservice");
const config_1 = require("../../config");
const logger_1 = __importDefault(require("./logger"));
const db_1 = __importDefault(require("./db"));
const axios_1 = __importDefault(require("axios"));
class OrderBookingService {
    constructor(tokenAddress) {
        this.tokenAddress = tokenAddress;
    }
    startBooking() {
        return __awaiter(this, void 0, void 0, function* () {
            const ms = config_1.delay;
            const startTime = new Date().getTime();
            const timer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const trades = yield db_1.default.findOne({
                        where: {
                            sellAtTime: null,
                            tokenAddress: this.tokenAddress
                        }
                    });
                    if (trades !== null) {
                        const oldProfit = Number(trades.profit);
                        const oldQuote = Number(trades.prevQuote);
                        const quoteinUsd = yield (0, tradeservice_1.getPairDetails)(this.tokenAddress);
                        const dexscreener = yield axios_1.default
                            .get(`https://api.dexscreener.com/latest/dex/tokens/${this.tokenAddress}`)
                            .then((res) => res)
                            .catch((err) => null);
                        let quoteInBNB = null;
                        if (dexscreener.data.pairs !== null) {
                            const plist = JSON.parse(JSON.stringify(dexscreener.data.pairs));
                            plist.map((item) => {
                                if (item.quoteToken.symbol === 'WBNB')
                                    quoteInBNB = item.priceNative;
                            });
                        }
                        logger_1.default.info(' Buy Price  is ' + trades.buyAtPrice + "  token: " + trades.name);
                        logger_1.default.info('Current Price is ' + quoteInBNB + "  token: " + trades.name);
                        const profit = 100 * (quoteInBNB - trades.buyAtPrice) / trades.buyAtPrice;
                        // Trailing stoploss
                        logger_1.default.info(' Old Profits for Token is ' + oldProfit.toFixed(2) + ' %');
                        logger_1.default.info(' New  Profits for Token is ' + profit.toFixed(2) + ' %');
                        if (profit < (1 - config_1.trailingstopLoss / 100) * oldQuote && oldProfit != 0) {
                            logger_1.default.info(' Selling Token due to Trailing stop , price came down to ' + quoteInBNB);
                            (0, tradeservice_1.sellToken)(this.tokenAddress);
                            trades.update({ sellAtTime: new Date(), sellAtPrice: parseFloat(quoteInBNB), profit: profit, prevQuote: parseFloat(quoteInBNB) });
                        }
                        else if (profit > oldProfit) {
                            logger_1.default.info(' Incrementing Token Profit   ' + profit.toFixed(2) + ' %');
                            trades.update({ profit: profit, prevQuote: parseFloat(quoteInBNB) });
                        }
                        else if (quoteInBNB <= (1 - config_1.stopLoss / 100) * (trades.buyAtPrice)) {
                            logger_1.default.info(' Selling Token due to Stoploss reached ' + quoteInBNB);
                            trades.update({ sellAtTime: new Date(), sellAtPrice: parseFloat(quoteInBNB), profit: profit, prevQuote: parseFloat(quoteInBNB) });
                            (0, tradeservice_1.sellToken)(this.tokenAddress);
                        }
                        else if (profit >= config_1.noGreedProfit) {
                            logger_1.default.info(' Selling Token due to NoGreedPoint reached ' + quoteInBNB);
                            trades.update({ sellAtTime: new Date(), sellAtPrice: parseFloat(quoteInBNB), profit: profit, prevQuote: parseFloat(quoteInBNB) });
                            (0, tradeservice_1.sellToken)(this.tokenAddress);
                        }
                        else {
                            trades.update({ prevQuote: parseFloat(quoteInBNB) });
                        }
                    }
                    else {
                        clearInterval(timer);
                    }
                }
                catch (error) {
                    logger_1.default.error(error);
                }
            }), ms);
            return timer;
        });
    }
}
exports.default = OrderBookingService;
