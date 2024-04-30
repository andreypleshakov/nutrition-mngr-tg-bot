import { Middleware, Scenes, Markup } from "telegraf";
import { DailyFood, FoodElement } from "../utils/models";
import {
  handleFromStartingScene,
  calculateDailyConsumption,
  todayOrCustomDateButton,
  isValidDateFormat,
  findAndcalculateDailyConsumption,
  getChooseProductButton,
} from "../utils/utils";

const addConsumptionSteps: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  waitingForNameAndMassOfProduct,
  todayOrCustomDate,
  customDate,
  productOptions,
];

const startingDialogueStep = addConsumptionSteps.findIndex(
  (scene) => scene === startingDialogue
);

const waitingForNameAndMassOfProductStep = addConsumptionSteps.findIndex(
  (scene) => scene === waitingForNameAndMassOfProduct
);

const todayOrCustomDateStep = addConsumptionSteps.findIndex(
  (scene) => scene === todayOrCustomDate
);

const customDateStep = addConsumptionSteps.findIndex(
  (scene) => scene === customDate
);

const productOptionsStep = addConsumptionSteps.findIndex(
  (scene) => scene === productOptions
);

//////////////////////////////////////

export const addConsumption = new Scenes.WizardScene<Scenes.WizardContext>(
  "ADD_CONSUMPTION",
  ...addConsumptionSteps
);

// start of the dialogue
async function startingDialogue(ctx: Scenes.WizardContext) {
  (ctx.wizard.state as DailyFood).tgId = ctx.from!.id;

  const fromStartingScene2 = await handleFromStartingScene(ctx);

  if (fromStartingScene2) {
    return;
  }

  await ctx.reply(
    "TODAY - check today's consumption statistic\n" +
      "CUSTOM - check custom day of your consumption",
    Markup.inlineKeyboard(todayOrCustomDateButton)
  );
  return ctx.wizard.selectStep(todayOrCustomDateStep);
}

//today or custom day
async function todayOrCustomDate(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "today") {
    (ctx.wizard.state as DailyFood).dateOfConsumption = new Date();

    await ctx.reply(
      "Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
    );
    return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
  }
  await ctx.reply("Enter date that you require in this format YYYY-MM-DD");
  return ctx.wizard.selectStep(customDateStep);
}

//custom date
async function customDate(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!isValidDateFormat(ctx.message.text)) {
    await ctx.reply(
      "Wrong! Enter date that you require in this format YYYY-MM-DD"
    );
    return;
  }

  (ctx.wizard.state as DailyFood).dateOfConsumption = new Date(
    ctx.message.text
  );
  await ctx.reply(
    "Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
  );
  return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
}

// waiting for name and mass of product
async function waitingForNameAndMassOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const actualState = ctx.wizard.state as DailyFood;

  const inputProduct = ctx.message.text.trim();

  // convert string of input to array of strings
  const partsOfInput = inputProduct.split(" ");

  // check length of array
  if (partsOfInput.length < 2) {
    await ctx.reply(
      "Wrong, enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
    );
    return;
  }

  // convert string to number and replace comma by dot
  const stringMass = partsOfInput.pop();
  const correctedMass = stringMass!.replace(",", ".");
  const productMass = parseFloat(correctedMass);

  // convert array of strings to string (product name)
  const productName = partsOfInput.join(" ");

  // check format of input
  if (!productName || !productMass || isNaN(Number(productMass))) {
    await ctx.reply(
      "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100, red apple 100, sweet red apple 100 etc.)"
    );
    return;
  }

  actualState.mass = productMass;

  const searchResults = await findAndcalculateDailyConsumption(productName);

  if (searchResults.length === 0) {
    await ctx.reply(
      "No matching products found. Please check the name and try again."
    );
    return;
  }
  const product = Object.values(searchResults).find(
    (product) => product.name === productName
  );

  if (
    (product && searchResults.length === 1) ||
    (product && product.name.split(" ").length >= 3)
  ) {
    const foodElement: FoodElement = {
      name: product.name,
      mass: actualState.mass,

      kcal: product.kcal,
      protein: product.protein,
      saturated_fat: product.saturated_fat,
      unsaturated_fat: product.unsaturated_fat,
      totalFat: product.totalFat,
      carbs: product.carbs,

      tgId: product.tgId,
    };

    await calculateDailyConsumption(foodElement, actualState, ctx);
    return;
  }

  actualState.arrayOfProducts = searchResults;

  const chooseProductButton = getChooseProductButton(searchResults);
  await ctx.reply("Did you mean one of these products?", chooseProductButton);

  return ctx.wizard.selectStep(productOptionsStep);
}

async function productOptions(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const actualState = ctx.wizard.state as DailyFood;

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  const product = Object.values(actualState.arrayOfProducts).find(
    (product) => product._id!.toString() === callBackData
  );

  await calculateDailyConsumption(product!, actualState, ctx);
}
