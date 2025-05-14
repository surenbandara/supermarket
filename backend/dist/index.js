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
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./utils/logger"));
const db_1 = __importDefault(require("./utils/db"));
const node_cron_1 = __importDefault(require("node-cron"));
const products_1 = require("./controllers/handlers/products");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.default)();
    app_1.default.listen(port, () => {
        logger_1.default.info(`Server running on port ${port}`);
    });
});
startServer();
// Run every day at 12:00 PM
node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    // cron.schedule('*/5 * * * *', async () => {
    logger_1.default.info('Scheduled job started: Product Firestore backup');
    try {
        yield (0, products_1.backupProducts)();
        logger_1.default.info('Scheduled job completed: Product Firestore backup');
    }
    catch (error) {
        logger_1.default.error(`Scheduled job failed: ${error}`);
    }
}));
