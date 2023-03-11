"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.honeyPotAbi = void 0;
exports.honeyPotAbi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internaltype": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internaltype": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internaltype": "address",
                "name": "dexRouter",
                "type": "address"
            },
            {
                "internaltype": "address[]",
                "name": "path",
                "type": "address[]"
            }
        ],
        "name": "check",
        "outputs": [
            {
                "components": [
                    {
                        "internaltype": "uint256",
                        "name": "buyGas",
                        "type": "uint256"
                    },
                    {
                        "internaltype": "uint256",
                        "name": "sellGas",
                        "type": "uint256"
                    },
                    {
                        "internaltype": "uint256",
                        "name": "estimatedBuy",
                        "type": "uint256"
                    },
                    {
                        "internaltype": "uint256",
                        "name": "exactBuy",
                        "type": "uint256"
                    },
                    {
                        "internaltype": "uint256",
                        "name": "estimatedSell",
                        "type": "uint256"
                    },
                    {
                        "internaltype": "uint256",
                        "name": "exactSell",
                        "type": "uint256"
                    }
                ],
                "internaltype": "struct HoneypotChecker.CheckerResponse",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "destroy",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internaltype": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internaltype": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
