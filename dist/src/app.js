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
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./lib/db"));
const mainjob_1 = __importDefault(require("./mainjob"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3001;
app.get('/hello', (req, res) => {
    res.send('Hello toto');
});
app.use(express_1.default.static(path_1.default.resolve('./ui')));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.resolve('ui/index.html'));
});
app.get("/totalProfits", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const totalProfits = yield db_1.default.sum('profit', { where: { sellAtTime: {
                [sequelize_1.Op.gt]: 100
            } } });
    res.send({ totalProfits: totalProfits });
}));
app.get("/investments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('here in investments query ');
    const investments = yield db_1.default.sum('investment', { where: { sellAtTime: {
                [sequelize_1.Op.gt]: 100
            } } });
    console.log(investments);
    res.send({ investments: investments });
}));
app.get("/totalTrades", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const totalTrades = yield db_1.default.count({ where: { sellAtTime: {
                [sequelize_1.Op.gt]: 100
            } } });
    res.send({ totalTrades: totalTrades });
}));
app.get("/allClosedTrades", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allTrades = yield db_1.default.findAll({ where: { sellAtTime: {
                [sequelize_1.Op.gt]: 100
            } } });
    res.send({ allClosedTrades: allTrades });
}));
app.get("/allOpenTrades", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allTrades = yield db_1.default.findAll({ where: { sellAtTime: null } });
    res.send({ allOpenTrades: allTrades });
}));
app.get("/allTrades", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allTrades = yield db_1.default.findAll({
        order: [
            ['buyAtTime', 'DESC']
        ]
    });
    res.send({ allTrades: allTrades });
}));
app.get("/deleteTrade/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Delete everyone named "Jane"
    yield db_1.default.destroy({
        where: {
            id: req.params['id']
        }
    });
    res.send({ deleted: req.params['id'] });
}));
app.listen(port, function () {
    console.log(`App is listening on port ${port} !`);
});
(0, mainjob_1.default)();
