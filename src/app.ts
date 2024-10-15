import { Telegraf, Scenes, session } from "telegraf";
import { message } from "telegraf/filters";
import "dotenv/config";
import assert from "assert-ts";
import { addConsumption } from "./scenes/addConsumption";
import { createProduct } from "./scenes/createProduct";
import { createCombinedProduct } from "./scenes/createCombinedProduct";
import { checkOrDeleteConsumptionStatistic } from "./scenes/checkOrDeleteConsumptionStatistic";
import { startCalculation } from "./scenes/startCalculation";
import { costOfOneProteinsGram } from "./scenes/costOfOneProteinsGram";
import mongoose from "mongoose";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { productBase } from "./utils/schemas";
import { FoodElement } from "./utils/models";
import Ajv from "ajv";
import { productRaiting } from "./scenes/productRaiting";

const userName = process.env.MONGODB_USER_NAME;
const rawPassword =
  process.env.MONGODB_ADMIN_PASSWORD !== undefined
    ? process.env.MONGODB_ADMIN_PASSWORD
    : "";
const encoderedPassword = encodeURIComponent(rawPassword);

mongoose
  .connect(
    `mongodb+srv://${userName}:${encoderedPassword}@cluster0.6tfa4iv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => console.log("Connected!"))
  .catch((error) => {
    console.error(error);
  });

const tgToken = process.env.TG_BOT_TOKEN;
assert(tgToken != null, "No TG_BOT_TOKEN environment variable found");

const nutritionMgrEmail = process.env.NUTRITION_MGR_EMAIL;
assert(
  nutritionMgrEmail != null,
  "No NUTRITION_MGR_EMAIL environment variable found"
);

// const ajv = new Ajv({ allErrors: true });

// const productSchema = {
//   type: "object",
//   properties: {
//     name: { type: "string" },
//     kcal: { type: "number", minimum: 0 },
//     protein: { type: "number", minimum: 0 },
//     totalFat: { type: "number", minimum: 0 },
//     saturated_fat: { type: "number", minimum: 0 },
//     unsaturated_fat: { type: "number", minimum: 0 },
//     carbs: { type: "number", minimum: 0 },
//     tgId: { type: "number" },
//   },
//   required: [
//     "name",
//     "kcal",
//     "protein",
//     "totalFat",
//     "saturated_fat",
//     "unsaturated_fat",
//     "carbs",
//     "tgId",
//   ],
//   additionalProperties: false,
// };

// const validate = ajv.compile(productSchema);

// const app = express();
// app.use(bodyParser.json());
// const port = process.env.PORT || 3000;

// app.post("/create_product", async (req: Request, res: Response) => {
//   const productData = req.body;

//   if (!validate(productData)) {
//     const errorMessages = validate.errors
//       ?.map((err) => {
//         // Adjusting for possible changes in property names
//         const path = err.instancePath.slice(1); // `instancePath` instead of `dataPath`
//         if (err.keyword === "required") {
//           return `${err.params.missingProperty} is required`;
//         } else if (err.keyword === "type") {
//           return `${path} should be a ${err.params.type}`;
//         } else if (err.keyword === "minimum") {
//           return `${path} should not be less than ${err.params.limit}`;
//         }
//         return `${path} ${err.message}`;
//       })
//       .join(", ");
//     return res.status(400).send(errorMessages);
//   }

//   try {
//     const newProduct = new productBase(productData);
//     await newProduct.save();
//     res.status(201).send("Product created successfully");
//   } catch (err: any) {
//     if (err.code === 11000) {
//       res.status(400).send("Duplicate combination of name and telegramId");
//     } else {
//       res.status(500).send("Server Error");
//     }
//   }
// });

const bot = new Telegraf<Scenes.WizardContext>(tgToken!);

const stage = new Scenes.Stage<Scenes.WizardContext>([
  startCalculation,
  createProduct,
  addConsumption,
  createCombinedProduct,
  checkOrDeleteConsumptionStatistic,
  // costOfOneProteinsGram,
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
bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey bro"));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

console.log("Starting application");
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
start();

async function start() {
  console.log("bot starting");
  await bot.launch();
}
