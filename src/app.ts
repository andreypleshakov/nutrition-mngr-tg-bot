import { Telegraf, Scenes, session } from "telegraf";
import "dotenv/config";
import dotenv from "dotenv";
import assert from "assert-ts";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { addConsumption } from "./scenes/addConsumption";
import { createProduct } from "./scenes/createProduct";
import { createCombinedProduct } from "./scenes/createCombinedProduct";
import { startCalculation } from "./scenes/startCalculation";
import mongoose from "mongoose";
import { productRaiting } from "./scenes/productRaiting";
import { manipulateConsumptionStatistic } from "./scenes/checkOrDeleteConsumptionStatistic";
import { addCustomConsumption } from "./scenes/addCustomConsumption";
import { setOrCheckGoal } from "./scenes/setOrCheckGoal";
import goalRoutes from "./api/goal/goalRoutes";
import productsRoutes from "./api/products/productsRoutes";
import statisticRoutes from "./api/statistic/statisticRoutes";
import userRoutes from "./api/users/userRoutes";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env",
});

const userName = process.env.MONGODB_USER_NAME;
const rawPassword = process.env.MONGODB_ADMIN_PASSWORD;
const tgToken = process.env.TG_BOT_TOKEN;

assert(userName != null, "No MONGODB_USER_NAME environment variable found");
assert(
  rawPassword != null,
  "No MONGODB_ADMIN_PASSWORD environment variable found"
);
assert(tgToken != null, "No TG_BOT_TOKEN environment variable found");

const encoderedPassword = encodeURIComponent(rawPassword);

mongoose
  .connect(
    `mongodb+srv://${userName}:${encoderedPassword}@cluster0.6tfa4iv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => console.log("Connected to MongoDB!"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

const bot = new Telegraf<Scenes.WizardContext>(tgToken);

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

// Express API server
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount API routes
app.use("/goal", goalRoutes);
app.use("/products", productsRoutes);
app.use("/statistic", statisticRoutes);
app.use("/users", userRoutes);

app.listen(3001, () => {
  console.log("API server running on http://localhost:3001");
});

console.log("Starting application");
start();

async function start() {
  console.log("bot starting");
  await bot.launch();
}
