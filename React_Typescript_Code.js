/**
 * Updates all the trades from all exchanges.
 * Call the each pairs api function  with timeInterval 2 second and pass minor&major
 * currency to the function and save the response to the multiple files with name contains
 * the exchange name and corressponding currency name with time
 * @class
 * FileName, GetrawPairs
 * @function
 * other: outputFormat, getallCurrencyPairs
 * @argument exchanges array of exchanges name
 */
import * as async from "async";
import * as fs from "fs";
import * as joi from "joi";
import * as _ from "lodash";
import * as moment from "moment";
import { exchanges, schemaOrderbook, useId } from "../common/constants";
import { getExchangeByid, updateAndSaveOrderbook } from "../common/db-functions";
import { getDb } from "../common/services/db-connect";
import { IexchangeResponse, IOrderdepth } from "../interfaces/public-interfaces";
import { ITradeJson } from "../interfaces/trade";
import GetrawPairs from "../pairs/get-raw-pairs";
import {calculateDepth} from "./cal-depth-orderbook";
import DownloadOrders from "./get-orderbook";
const exChangeCurrencies: string[] = [];
const DownloadOrderObject = new DownloadOrders();
const DownloadRawObject = new GetrawPairs();
const fullFunctions: object[] = []; // contains fullfunction array data
let id: string = "";
let Orderdepthvalue: IOrderdepth;
getDb();

// main function to get trades
export function updateOrderBook() {
    async.eachSeries(exchanges, async (exchangeName, outerCallback) => {
        console.log(exchangeName);
        const returnCurrency: string[] = await DownloadRawObject.getallCurrencyPairs(exchangeName);
        async.eachSeries(returnCurrency, async (currency, outerCallback2) => {
            reduceData(currency, exchangeName, outerCallback2);
        }, (errorOuter2) => {
            console.log("not done ordervbook!!!");
            outerCallback();
        });
    }, async (err) => {
        console.log("everything done");
       // upDateTrade();
    });
}



const reduceData = (currency, exchangeName, outerCallback2) => {
    let splitCurrency = currency.split("-");
    async.retry({times: 5, interval: 100}, (back) => {
        if (useId.indexOf(exchangeName) !== -1) {
            id = currency.split("&")[0];
            splitCurrency = currency.split("&")[1].split("-");
        }
        DownloadOrderObject.getOrderBook(exchangeName, splitCurrency[0], splitCurrency[1], id).then(async (result: ITradeJson[]) => {
            back(null, result);
        }).catch(async (err) => {
            console.log("retry@@@order", currency, exchangeName);
           // back(err);
            outerCallback2();
        });
    }, (errorRetry, exchangeReturn) => {
             if (exchangeReturn && exchangeReturn !== "undefined") {
            const obj: string = JSON.stringify(exchangeReturn);
            async.forEachOf(exchangeReturn, async (res: ITradeJson, k, callbackreturn) => {
                joiValidate(res, exchangeName, currency, splitCurrency);
                callbackreturn();
            }, async (erroorr) => {
                if (erroorr) {
                    console.log(erroorr);
                }
                outerCallback2();
            });
        }
    });
};

// validate the data before save
const joiValidate = async (res, exchangeName, currency, splitCurrency) => {
     Orderdepthvalue = await calculateDepth(res, exchangeName);
     console.log("==>>", splitCurrency, "-===>", Orderdepthvalue);
     joi.validate(Orderdepthvalue, schemaOrderbook, async (joierr, value) => {
        if (joierr) {
            const errors = [];
            if (Orderdepthvalue !== undefined && !Orderdepthvalue.hasOwnProperty("message")) {
                joierr.details.forEach((detail) => {
                    errors.push({
                        key: detail.path,
                        message: detail.message,
                    });
                });
                console.log(errors, exchangeName + "-" + currency);
            }
        } else {
            const findedExchange: IexchangeResponse = await getExchangeByid(exchangeName);
            if (findedExchange && findedExchange._id) {
                const updateData = {
                    asks: Orderdepthvalue.asks,
                    bids: Orderdepthvalue.bids,
                    exchanges_id: findedExchange._id,
                    major_currency: splitCurrency[0],
                    minor_currency: splitCurrency[1],
                    timestamp: Orderdepthvalue.timestamp,
                };
                updateAndSaveOrderbook(updateData);
            }
        }
    });
};

