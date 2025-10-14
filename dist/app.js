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
const telegraf_1 = require("telegraf");
require("dotenv/config");
const dotenv_1 = __importDefault(require("dotenv"));
const assert_ts_1 = __importDefault(require("assert-ts"));
const addConsumption_1 = require("./scenes/addConsumption");
const createProduct_1 = require("./scenes/createProduct");
const createCombinedProduct_1 = require("./scenes/createCombinedProduct");
const startCalculation_1 = require("./scenes/startCalculation");
const mongoose_1 = __importDefault(require("mongoose"));
const productRaiting_1 = require("./scenes/productRaiting");
const checkOrDeleteConsumptionStatistic_1 = require("./scenes/checkOrDeleteConsumptionStatistic");
const addCustomConsumption_1 = require("./scenes/addCustomConsumption");
const setOrCheckGoal_1 = require("./scenes/setOrCheckGoal");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./api/users/userRoutes"));
const statisticRoutes_1 = __importDefault(require("./api/statistic/statisticRoutes"));
const goalRoutes_1 = __importDefault(require("./api/goal/goalRoutes"));
const productsRoutes_1 = __importDefault(require("./api/products/productsRoutes"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env",
});
const userName = process.env.MONGODB_USER_NAME;
const rawPassword = process.env.MONGODB_ADMIN_PASSWORD;
const tgToken = process.env.TG_BOT_TOKEN;
(0, assert_ts_1.default)(userName != null, "No MONGODB_USER_NAME environment variable found");
(0, assert_ts_1.default)(rawPassword != null, "No MONGODB_ADMIN_PASSWORD environment variable found");
(0, assert_ts_1.default)(tgToken != null, "No TG_BOT_TOKEN environment variable found");
const encoderedPassword = encodeURIComponent(rawPassword);
const webAppUrlTest = process.env.WEB_APP_URL;
const app = (0, express_1.default)();
const corsOptions = {
    origin: [webAppUrlTest],
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
const PORT = 3001;
app.use("/users", userRoutes_1.default);
app.use("/statistic", statisticRoutes_1.default);
app.use("/goal", goalRoutes_1.default);
app.use("/products", productsRoutes_1.default);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
mongoose_1.default
    .connect(`mongodb+srv://${userName}:${encoderedPassword}@cluster0.6tfa4iv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => console.log("Connected to MongoDB!"))
    .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
});
const bot = new telegraf_1.Telegraf(tgToken);
const stage = new telegraf_1.Scenes.Stage([
    startCalculation_1.startCalculation,
    createProduct_1.createProduct,
    addConsumption_1.addConsumption,
    addCustomConsumption_1.addCustomConsumption,
    createCombinedProduct_1.createCombinedProduct,
    checkOrDeleteConsumptionStatistic_1.manipulateConsumptionStatistic,
    setOrCheckGoal_1.setOrCheckGoal,
    productRaiting_1.productRaiting,
]);
stage.command("cancel", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Cancelling the current operation...");
    yield ctx.scene.leave();
    ctx.scene.enter("START_CALCULATION");
}));
bot.use((0, telegraf_1.session)());
bot.use(stage.middleware());
bot.command("start_calculation", (ctx) => {
    ctx.scene.enter("START_CALCULATION");
});
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Press /start_calculation to start use this bot OR /leave_scene to stop using this bot "));
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
console.log("Starting application");
start();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("bot starting");
        yield bot.launch();
    });
}
