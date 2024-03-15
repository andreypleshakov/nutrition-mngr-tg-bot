import { Telegraf, Scenes, session } from "telegraf";
import { message } from "telegraf/filters";
import "dotenv/config";
import assert from "assert-ts";
import { addTodayFoodToBase } from "./scenes/addTodayFoodToBase";
import { addProductToBase } from "./scenes/addProductToBase";
import { addCombinedProduct } from "./scenes/addCombinedProduct";
import { checkTodayConsumption } from "./scenes/checkTodayConsumption";

const tgToken = process.env.TG_BOT_TOKEN;
assert(tgToken != null, "No TG_BOT_TOKEN environment variable found");

const nutritionMgrEmail = process.env.NUTRITION_MGR_EMAIL;
assert(
  nutritionMgrEmail != null,
  "No NUTRITION_MGR_EMAIL environment variable found"
);

const bot = new Telegraf<Scenes.WizardContext>(tgToken!);

const stage = new Scenes.Stage<Scenes.WizardContext>([
  addProductToBase,
  addTodayFoodToBase,
  addCombinedProduct,
  checkTodayConsumption,
]);

bot.use(session());
bot.use(stage.middleware());

bot.command("add_daily_product", (ctx) => {
  ctx.scene.enter("ADD_TODAY_FOOD_TO_BASE");
});

bot.command("add_product", (ctx) => {
  ctx.scene.enter("ADD_PRODUCT_TO_BASE");
});

bot.command("add_combined_product", (ctx) => {
  ctx.scene.enter("ADD_COMBINED_PRODUCT");
});

bot.command("check_today_consumption", (ctx) => {
  ctx.scene.enter("CHECK_TODAY_CONSUMPTION");
});

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey bro"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

console.log("Starting application");
start();

async function start() {
  await bot.launch();
}
