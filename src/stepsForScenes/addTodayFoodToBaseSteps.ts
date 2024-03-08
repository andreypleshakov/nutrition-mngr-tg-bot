import { Scenes } from "telegraf";
import { DialogueState, DailyFood } from "../utils/models";
import {
  yesAndNoButton,
  yesOrNoButton,
  textIsNumber,
  nextStep,
  isValidDateFormat,
  existenceOfTheSameProduct,
  calculateNutrition,
  addCalculatedNutrition,
} from "../utils/utils";

const STEPS = [
  startingDialogue,
  dateOfDailyProduct,
  nameOfProduct,
  isAddTheProduct,
  massOfProduct,
  combineProductInfo,
  isFixingSomething,
  calculateAndAddNutrition,
];

export const startingDialogueStep = STEPS.findIndex(
  (schene) => schene === startingDialogue
);

export const dateOfDailyProductStep = STEPS.findIndex(
  (schene) => schene === dateOfDailyProduct
);

export const nameOfProductStep = STEPS.findIndex(
  (schene) => schene === nameOfProduct
);

export const isAddTheProductStep = STEPS.findIndex(
  (schene) => schene === isAddTheProduct
);

export const massOfProductStep = STEPS.findIndex(
  (schene) => schene === massOfProduct
);

export const combineProductInfoStep = STEPS.findIndex(
  (schene) => schene === combineProductInfo
);

export const isFixingSomethingStep = STEPS.findIndex(
  (schene) => schene === isFixingSomething
);

export const calculateAndAddNutritionStep = STEPS.findIndex(
  (schene) => schene === calculateAndAddNutrition
);

//////////////////////////////////////

// finction: start of the dialogue
async function startingDialogue(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 0
  await ctx.reply("Date of daily product in this format DD.MM.YYYY");
  return ctx.wizard.next();
}

// function: waiting of the date of the daily product
async function dateOfDailyProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 1
  if (!isValidDateFormat(ctx.message.text)) {
    await ctx.reply("Wrong date format");
    return;
  }

  (ctx.wizard.state as DailyFood).dateOfDaily = ctx.message.text;

  await ctx.reply("Name of product");
  return ctx.wizard.next();
}

// function: waiting of the name of the product
async function nameOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 2
  const productName = ctx.message.text;
  (ctx.wizard.state as DailyFood).name = productName;
  if (ctx.message.text === undefined) {
    await ctx.reply("Wrong, write a product name");
    return;
  }
  if (await existenceOfTheSameProduct(productName)) {
    await ctx.reply("Product exists in database");

    await ctx.reply("Mass of product in grams");
    return ctx.wizard.selectStep(4);
  }
  await ctx.reply("Product does not exist in database");
  await ctx.reply("Do you want to add it?", yesAndNoButton);
  return ctx.wizard.next();
}

// function: waiting for "yes" or "no" answer of adding the product
async function isAddTheProduct(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 3
  const succesButton = yesOrNoButton(ctx);
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
  return await ctx.scene.leave();
}

// function: waiting for the mass of the product
async function massOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 4
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  (ctx.wizard.state as DailyFood).mass = parseInt(ctx.message.text);
  await ctx.reply("Press Next to calculate nutrition", nextStep);
  return ctx.wizard.next();
}

// function: combine the saved product information into one message
async function combineProductInfo(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 5
  const productInfo = `
      Date: ${(ctx.wizard.state as DailyFood).dateOfDaily}
      Product Name: ${(ctx.wizard.state as DailyFood).name}
      Mass: ${(ctx.wizard.state as DailyFood).mass + " g"}`;

  await ctx.reply(productInfo);

  await ctx.reply("Do you want to fix something?", yesAndNoButton);
  return ctx.wizard.next();
}

// function: waiting for "yes" or "no" answer of fixing something
async function isFixingSomething(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 6
  const succesButton = yesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);
  if (succesButton) {
    await ctx.reply("Date of daily product in this format DD.MM.YYYY");
    return ctx.wizard.selectStep(1);
  }
  await ctx.reply("Press Next to calculate nutrition", nextStep);
  return ctx.wizard.next();
}

// function: final step to calculate nutrition and add it to the daily statistics
async function calculateAndAddNutrition(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 7
  const productName = (ctx.wizard.state as DailyFood).name;
  const mass = (ctx.wizard.state as DailyFood).mass;
  const date = (ctx.wizard.state as DailyFood).dateOfDaily;
  if (await existenceOfTheSameProduct(productName)) {
    const nutrition = await calculateNutrition(productName, mass);
    if (nutrition) {
      await addCalculatedNutrition(nutrition, date);
    }
  }
  await ctx.answerCbQuery(undefined);
  await ctx.reply("Product is calculated and added to daily statistics");
  return await ctx.scene.leave();
}
