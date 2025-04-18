import { Telegraf, Scenes, session } from "telegraf";
import "dotenv/config";
import dotenv from "dotenv";
import assert from "assert-ts";
import { addConsumption } from "./scenes/addConsumption";
import { createProduct } from "./scenes/createProduct";
import { createCombinedProduct } from "./scenes/createCombinedProduct";
import { startCalculation } from "./scenes/startCalculation";
import mongoose from "mongoose";
import { productRaiting } from "./scenes/productRaiting";
import { manipulateConsumptionStatistic } from "./scenes/checkOrDeleteConsumptionStatistic";
import { addCustomConsumption } from "./scenes/addCustomConsumption";
import { setOrCheckGoal } from "./scenes/setOrCheckGoal";
import express from "express";
import cors from "cors";
import userRoutes from "./api/users/userRoutes";
import statisticRoutes from "./api/statistic/statisticRoutes";
import goalRoutes from "./api/goal/goalRoutes";
import productsRoutes from "./api/products/productsRoutes";

const userName = process.env.MONGODB_USER_NAME;
const rawPassword =
  process.env.MONGODB_ADMIN_PASSWORD !== undefined
    ? process.env.MONGODB_ADMIN_PASSWORD
    : "";
const encoderedPassword = encodeURIComponent(rawPassword);
// const webAppUrlTest = process.env.WEB_APP_URL_TEST;

// const app = express();

// const corsOptions = {
//   origin: [webAppUrlTest!],
//   methods: ["GET", "POST", "DELETE"],
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.json());

// const PORT = 3001;

// app.use("/users", userRoutes);
// app.use("/statistic", statisticRoutes);
// app.use("/goal", goalRoutes);
// app.use("/products", productsRoutes);

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

mongoose
  .connect(
    `mongodb+srv://${userName}:${encoderedPassword}@cluster0.6tfa4iv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => console.log("Connected!"))
  .catch((error) => {
    console.error(error);
  });

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env",
});

const tgToken = process.env.TG_BOT_TOKEN;
assert(tgToken != null, "No TG_BOT_TOKEN environment variable found");

const bot = new Telegraf<Scenes.WizardContext>(tgToken!);

const stage = new Scenes.Stage<Scenes.WizardContext>([
  startCalculation,
  createProduct,
  addConsumption,
  addCustomConsumption,
  createCombinedProduct,
  manipulateConsumptionStatistic,
  setOrCheckGoal,
  productRaiting,
]);

stage.command("cancel", async (ctx) => {
  await ctx.reply("Cancelling the current operation...");
  await ctx.scene.leave();
  ctx.scene.enter("START_CALCULATION");
});

bot.use(session());
bot.use(stage.middleware());

bot.command("start_calculation", (ctx) => {
  ctx.scene.enter("START_CALCULATION");
});

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) =>
  ctx.reply(
    "Press /start_calculation to start use this bot OR /leave_scene to stop using this bot "
  )
);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

console.log("Starting application");
start();

async function start() {
  console.log("bot starting");
  await bot.launch();
}
