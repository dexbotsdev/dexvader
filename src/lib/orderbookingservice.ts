import { getPairDetails, sellToken } from "./tradeservice";
import { delay, noGreedProfit, stopLoss, trailingstopLoss } from "../../config";
import logger from './logger';
import Tradex from './db';
import axios from "axios";

class OrderBookingService {
    tokenAddress: any;
    constructor(tokenAddress: any) {
        this.tokenAddress = tokenAddress
    }

    async startBooking() {
        const ms = delay

        const startTime = new Date().getTime();
        const timer = setInterval(async () => {

            try {

                const trades = await Tradex.findOne({
                    where: {
                        sellAtTime: null,
                        tokenAddress: this.tokenAddress
                    }
                });

                if (trades !== null) {
                    const oldProfit = Number(trades.profit);
                    const oldQuote = Number(trades.prevQuote);

                    const quoteinUsd = await getPairDetails(this.tokenAddress);
                    const dexscreener = await axios
                        .get(`https://api.dexscreener.com/latest/dex/tokens/${this.tokenAddress}`)
                        .then((res) => res)
                        .catch((err) => null);

                    let quoteInBNB = null;
                    if (dexscreener.data.pairs !== null) {

                        const plist = JSON.parse(JSON.stringify(dexscreener.data.pairs));

                        plist.map((item: { quoteToken: { symbol: string; }; priceNative: any; }) => {
                            if (item.quoteToken.symbol === 'WBNB')
                                quoteInBNB = item.priceNative;
                        })
                    }
                    logger.info(' Buy Price  is ' + trades.buyAtPrice +"  token: "+trades.name)

                    logger.info('Current Price is ' + quoteInBNB +"  token: "+trades.name)
                    const profit = 100 * (quoteInBNB - trades.buyAtPrice) / trades.buyAtPrice;

                    // Trailing stoploss
                    logger.info(' Old Profits for Token is ' + oldProfit.toFixed(2) + ' %');
                    logger.info(' New  Profits for Token is ' + profit.toFixed(2) + ' %');
                    if (profit < (1 - trailingstopLoss / 100) * oldQuote && oldProfit != 0) {

                        logger.info(' Selling Token due to Trailing stop , price came down to ' + quoteInBNB  );
                        sellToken(this.tokenAddress);

                        trades.update({ sellAtTime: new Date(), sellAtPrice: parseFloat(quoteInBNB), profit: profit ,prevQuote:parseFloat(quoteInBNB) })
                    } else if (profit > oldProfit) {

                        logger.info(' Incrementing Token Profit   ' + profit.toFixed(2) + ' %');

                        trades.update({ profit: profit,prevQuote:parseFloat(quoteInBNB) })

                    } else if (quoteInBNB <= (1 - stopLoss / 100) * (trades.buyAtPrice)) {
                        logger.info(' Selling Token due to Stoploss reached ' + quoteInBNB);
                        trades.update({ sellAtTime: new Date(), sellAtPrice: parseFloat(quoteInBNB), profit: profit ,prevQuote:parseFloat(quoteInBNB)})
                        sellToken(this.tokenAddress);

                    } else if (profit >= noGreedProfit) {
                        logger.info(' Selling Token due to NoGreedPoint reached ' + quoteInBNB);
                        trades.update({ sellAtTime: new Date(), sellAtPrice: parseFloat(quoteInBNB), profit: profit ,prevQuote:parseFloat(quoteInBNB)})
                        sellToken(this.tokenAddress);

                    } else {
                        trades.update({prevQuote:parseFloat(quoteInBNB) })

                    }
                } else {
                    clearInterval(timer)
                }

            } catch (error) {
                logger.error(error)

            }


        }, ms)

        return timer
    }


}


export default OrderBookingService;