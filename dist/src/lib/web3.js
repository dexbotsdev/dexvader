"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_1 = __importDefault(require("web3"));
const config_1 = require("../../config");
const getWeb3 = () => {
    return new web3_1.default(config_1.RPC_BSC);
};
exports.default = getWeb3;
