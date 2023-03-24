import Parse from 'parse/node'
import { appId, appKey, wsUrl, liquidityBarrier, bnbToInvestPerToken, maxBuyTaxAllowed, maxSellTaxAllowed, wbnbAddress } from '../config';
import { checkHoneyPot, checkAbiHoneyPot, honeypotCheckerCaller, getPairDetails, buyToken, checkSrcHoneyPot, getTokenPrice } from './lib/tradeservice';
import Tradex,{ sequelize } from './lib/db';
 import logger from './lib/logger';
import OrderBookingService from './lib/orderbookingservice';
import axios from 'axios';

const main = async () => {

    logger.info('Starting the DexVader Job ');


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
                .get(`https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${data.tokenAddress}&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG`)
                .then(async (response) => { 
                  
                    let honeyPot = checkAbiHoneyPot(response.data.result[0].ABI);
                    let shitpot = checkSrcHoneyPot(response.data.result[0].SourceCode);

                    logger.info('Passed Token Address ' + data.tokenAddress )
                    logger.info('Passed Token Verification Check ' + response.data.message)
                    logger.info('Passed HoneyPot Check L1 ' + !honeyPot )
                    logger.info('Passed HoneyPot Check L2 ' + !shitpot )
                    logger.info('Passed Max buyTax Check ' + buyTax )
                    logger.info('Passed Max sellTax Check ' + sellTax )
                    logger.info('Passed Min LiQuidity Check ' + data.lpUsdValue +":"+ liquidityBarrier)
 
                     if (!honeyPot && !shitpot && Number(buyTax) <= maxBuyTaxAllowed && Number(sellTax) <= maxSellTaxAllowed && Number(buyTax) >= 0 && Number(sellTax) >= 0 && response.data.message === 'OK') {
                        logger.info('Saving first Initial Data ')

                        const tradex = Tradex.build(data);
                        await tradex.save();
                        logger.info('Saved Initial Data Commencing Trade ')

                        try {
                             let pairBNBPrice=0;
                            const dexscreener = await axios
                            .get(`https://api.dexscreener.com/latest/dex/tokens/${data.tokenAddress}`)
                            .then((res) => res)
                            .catch((err) => null);
                    
                            if(dexscreener.data.pairs !== null){

                                const plist = JSON.parse(JSON.stringify(dexscreener.data.pairs));

                                 plist.map((item: { quoteToken: { symbol: string; }; priceNative: any; })=>{
                                    if(item.quoteToken.symbol==='WBNB')
                                    pairBNBPrice= item.priceNative;
                                })
                            }

                            if(pairBNBPrice === 0){
                                logger.error(' Token is not Paired with WBNB')
                            }
                            else
                            await buyToken(data.tokenAddress,data.name).then( async(recpt)=>{

                                let quoteInBNB  =Number(await getTokenPrice(wbnbAddress, data.tokenAddress));
                                logger.error("Current Price of Token in BNB " + quoteInBNB);

 
                                if (recpt !== null) {
                
                                    const order = new OrderBookingService(data.tokenAddress);
                                    await order.startBooking();
                                    const quantity = Number((bnbToInvestPerToken/Number(quoteInBNB)).toFixed(4));

                                    const trades = await Tradex.findOne({
                                        where: {
                                            buyAtTime: null,
                                            tokenAddress: data.tokenAddress
                                        }
                                    });
                                    trades.update({ quantity:quantity,buyAtTime: new Date(),investment: bnbToInvestPerToken, buyAtPrice: quoteInBNB, profit: 0.0 }) 

                                 } 
                              }).catch((error)=>{
                                console.log(data.tokenAddress)

                                logger.error("L1: ERROR PLACING TRADE " + new String(error));
                              })  

                        } catch (error:any) {
                            console.log(data.tokenAddress)

                            logger.error("L2 : ERROR PLACING TRADE " + new String(error));
                        }

                    }


                })
                .catch((err) => {
                    console.log(err);
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
function getPrice(token: any, BUSD: any) {
    throw new Error('Function not implemented.');
}

