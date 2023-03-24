"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: './data/database.sqlite',
    logging: false,
    pool: {
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});
class Tradex extends sequelize_1.Model {
}
;
Tradex.init({
    // Model attributes are defined here
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tokenAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    symbol: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    pairAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    baseAddress: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    signaledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false
    },
    baseName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    signalPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: false
    },
    investment: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: false
    },
    buyAtTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    buyAtPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: true
    },
    sellAtTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    sellAtPrice: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: true
    },
    profit: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: false
    },
    prevQuote: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: true
    },
    quantity: {
        type: sequelize_1.DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: false
    },
}, {
    tableName: 'tradex',
    sequelize: exports.sequelize
});
exports.default = Tradex;
