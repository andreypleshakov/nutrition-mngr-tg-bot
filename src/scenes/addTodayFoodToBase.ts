import { Middleware, Scenes } from "telegraf";
import { DialogueState, DailyFood } from "../utils/models";
import {
  getYesOrNoButton,
  yesOrNoButton,
  textIsNumber,
  isValidDateFormat,
  existenceOfTheSameProduct,
  calculateNutrition,
  addCalculatedNutrition,
  replaceCommaToDot,
} from "../utils/utils";

const addTodayFoodToBaseSteps: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  dateOfDailyProduct,
  nameOfProduct,
  isAddTheProduct,
  massOfProduct,
  isFixingSomething,
];

const startingDialogueStep = addTodayFoodToBaseSteps.findIndex(
  (scene) => scene === startingDialogue
);

const dateOfDailyProductStep = addTodayFoodToBaseSteps.findIndex(
  (scene) => scene === dateOfDailyProduct
);

const nameOfProductStep = addTodayFoodToBaseSteps.findIndex(
  (scene) => scene === nameOfProduct
);

const isAddTheProductStep = addTodayFoodToBaseSteps.findIndex(
  (scene) => scene === isAddTheProduct
);

const massOfProductStep = addTodayFoodToBaseSteps.findIndex(
  (scene) => scene === massOfProduct
);

const isFixingSomethingStep = addTodayFoodToBaseSteps.findIndex(
  (scene) => scene === isFixingSomething
);

//////////////////////////////////////

export const addTodayFoodToBase = new Scenes.WizardScene<Scenes.WizardContext>(
  "ADD_TODAY_FOOD_TO_BASE",
  ...addTodayFoodToBaseSteps
);

// start of the dialogue
async function startingDialogue(ctx: Scenes.WizardContext) {
  await ctx.reply("Date of daily product in this format: DD.MM.YYYY");
  return ctx.wizard.selectStep(dateOfDailyProductStep);
}

// waiting of the date of the daily product
async function dateOfDailyProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!isValidDateFormat(ctx.message.text)) {
    await ctx.reply("Wrong date format");
    return;
  }

  (ctx.wizard.state as DailyFood).dateOfDaily = ctx.message.text;

  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(nameOfProductStep);
}

// waiting of the name of the product
async function nameOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const productName = ctx.message.text.trim();
  (ctx.wizard.state as DailyFood).name = productName;
  if (ctx.message.text === undefined) {
    await ctx.reply("Wrong, write a product name");
    return;
  }
  if (await existenceOfTheSameProduct(productName)) {
    await ctx.reply("Mass of product in grams");
    return ctx.wizard.selectStep(massOfProductStep);
  }
  await ctx.reply("Product does not exist in database");
  await ctx.reply("Do you want to add it?", yesOrNoButton);
  return ctx.wizard.selectStep(isAddTheProductStep);
}

// waiting for "yes" or "no" answer of adding the product
async function isAddTheProduct(ctx: Scenes.WizardContext) {
  const succesButton = getYesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);
  if (succesButton) {
    let initalState = {} as DialogueState;
    initalState.name = (ctx.wizard.state as DailyFood).name;
    ctx.scene.enter("ADD_PRODUCT_TO_BASE", initalState);
    return;
  }

  await ctx.reply(
    "You can't count nutrition of your daily product because it does not exist in product base"
  );
  await ctx.reply("If you want to enter new product use comman /add_product");
  return ctx.scene.leave();
}

// waiting for the mass of the product
async function massOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  const actualState = ctx.wizard.state as DailyFood;

  actualState.mass = replaceCommaToDot(ctx.message.text);

  const productInfo = `
    Date: ${actualState.dateOfDaily}
    Product Name: ${actualState.name}
    Mass: ${actualState.mass + " g"}`;

  await ctx.reply(productInfo);

  await ctx.reply("Do you want to fix something?", yesOrNoButton);
  return ctx.wizard.selectStep(isFixingSomethingStep);
}

// waiting for "yes" or "no" answer of fixing something
async function isFixingSomething(ctx: Scenes.WizardContext) {
  const succesButton = getYesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);
  if (succesButton) {
    await ctx.reply("Date of daily product in this format: DD.MM.YYYY");
    return ctx.wizard.selectStep(dateOfDailyProductStep);
  }

  await ctx.reply("Wait till results will be calculated");

  const actualState = ctx.wizard.state as DailyFood;
  const productName = actualState.name;
  const mass = actualState.mass;
  const date = actualState.dateOfDaily;

  if (await existenceOfTheSameProduct(productName)) {
    const nutrition = await calculateNutrition(productName, mass);

    if (nutrition) {
      await addCalculatedNutrition(nutrition, date);
    }
  }

  await ctx.reply("Product is calculated and added to daily statistics");
  return ctx.scene.leave();
}
