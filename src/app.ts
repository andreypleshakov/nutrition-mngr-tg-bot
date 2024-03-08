import { Telegraf, Scenes, session } from "telegraf";
import { message } from "telegraf/filters";
import "dotenv/config";
import assert from "assert-ts";
import { JWT } from "google-auth-library";
import { addTodayFoodToBase } from "./scenes/addTodayFoodToBase";
import { addProductToBase } from "./scenes/addProductToBase";
import { addCombinedProduct } from "./scenes/addCombinedProduct";

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
