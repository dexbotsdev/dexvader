import Parse from 'parse/node'
import { appId, appKey, wsUrl, liquidityBarrier, bnbToInvestPerToken } from '../config';
import { checkHoneyPot, checkAbiHoneyPot, honeypotCheckerCaller, getPairDetails } from './lib/tradeservice';
import Tradex,{ sequelize } from './lib/db';
 import logger from './lib/logger';
import OrderBookingService from './lib/orderbookingservice';
import axios from 'axios';

const main = async () => {

    logger.info('Starting the DexVader Job '+appId+":"+appKey);


    Parse.initialize(appId, appKey);
    Parse.liveQueryServerURL = wsUrl
    const SignalList = Parse.Object.extend("TokenBuzzPro");
    let query = new Parse.Query(SignalList);
    let subscription = await query.subscribe();
    logger.info('Starting subscription to DexVader Job ');

    subscription.on('open', () => {
        logger.info('subscription opened');

        sequelize.sync({ alter: true }).then((res)=>res).catch((error)=>{
            logger.error(error);
        });

    });
    subscription.on('close', (error: any) => {
        logger.error(error)
        main();
    });
    subscription.on('create', async (object: any) => {
        const data = JSON.parse(JSON.stringify(object));
        logger.warning("New Trade Signal Recd " + data.name)
        logger.warning("New Trade Signal Recd " + data.tokenAddress)
        logger.warning("New Trade Signal LPUSD Value " + data.lpUsdValue)
        logger.warning("System Check LPUSD Value " + liquidityBarrier)



        if (Number(data.lpUsdValue) > liquidityBarrier) {

            logger.docs('Liquidity Check Passed '+data.lpUsdValue );

            const {
                buyGas,
                sellGas,
                estimatedBuy,
                exactBuy,
                estimatedSell,
                exactSell,
            } = await checkHoneyPot(data.tokenAddress);
            const [buyTax, sellTax] = [
                honeypotCheckerCaller.calculateTaxFee(estimatedBuy, exactBuy),
                honeypotCheckerCaller.calculateTaxFee(estimatedSell, exactSell),
            ];
            logger.docs('buyTax Check Passed ' + buyTax);
            logger.docs('sellTax Check Passed ' + sellTax);
            await axios
                .get(`https://api.bscscan.com/api?module=contract&action=getabi&address=${data.tokenAddress}&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG`)
                .then(async (response) => {

                    

                    let honeyPot = checkAbiHoneyPot(response.data.result);

                    logger.info('Passed Token Address ' + data.tokenAddress )
                    logger.info('Passed Token Verification Check ' + response.data.message)
                    logger.info('Passed HoneyPot Check ' + !honeyPot +":"+ !honeyPot)
                    logger.info('Passed buyTax Check ' + buyTax +":"+ + (Number(buyTax) <= 20))
                    logger.info('Passed sellTax Check ' + sellTax +":"+ (Number(sellTax) <= 20))
                    logger.info('Passed LiQuidity Check ' + data.lpUsdValue +":"+ liquidityBarrier)

                    /*
                    console.log(!honeyPot)
                    console.log(Number(buyTax) <= 20)
                    console.log(Number(sellTax) <= 20)
                    console.log(Number(buyTax) >= 0)
                    console.log(Number(sellTax) >= 0)
                    console.log(response.data.message === 'OK') */

                     if (!honeyPot && Number(buyTax) <= 20 && Number(sellTax) <= 20 && Number(buyTax) >= 0 && Number(sellTax) >= 0 && response.data.message === 'OK') {
                        logger.info('Saving first Initial Data ')

                        const tradex = Tradex.build(data);
                        await tradex.save();
                        logger.info('Saved Initial Data Commencing Trade ')

                        try {
                            const dexscreener = await axios
                            .get(`https://api.dexscreener.com/latest/dex/tokens/${data.tokenAddress}`)
                            .then((res) => res)
                            .catch((err) => null);
                    
                            let quoteInBNB=null;
                            if(dexscreener.data.pairs !== null){

                                const plist = JSON.parse(JSON.stringify(dexscreener.data.pairs));

                                 plist.map((item: { quoteToken: { symbol: string; }; priceNative: any; })=>{
                                    if(item.quoteToken.symbol==='WBNB')
                                    quoteInBNB= item.priceNative;
                                })
                            }
 
                            if (quoteInBNB != null   ) {
                                logger.info('    QUOTE For  ' + data.name + ' is ' + + quoteInBNB)

                                const quantity = Number((bnbToInvestPerToken/Number(quoteInBNB)).toFixed(4));

                                const trades = await Tradex.findOne({
                                    where: {
                                        buyAtTime: null,
                                        tokenAddress: data.tokenAddress
                                    }
                                });
                                trades.update({ quantity:quantity,buyAtTime: new Date(),investment: bnbToInvestPerToken, buyAtPrice: quoteInBNB, profit: 0.0 }) 

                                
                                const order = new OrderBookingService(data.tokenAddress);
                                await order.startBooking();

                            }

                        } catch (error:any) {
                            logger.error("ERROR PLACING TRADE " + error.message);
                        }

                    }


                })
                .catch((err) => {
                    logger.error('Token Not Verified so Skipped')
                });
                

        } else {
            logger.error("Criteria Not Met")
        }




    });
    subscription.on('update', () => {
        logger.error('object updated');
    });
}

export default main;
