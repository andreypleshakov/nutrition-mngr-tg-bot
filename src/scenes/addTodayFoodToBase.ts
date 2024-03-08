import { Scenes } from "telegraf";
import {
  isValidDateFormat,
  existenceOfTheSameProduct,
  yesAndNoButton,
  yesOrNoButton,
  textIsNumber,
  nextStep,
  calculateNutrition,
  addCalculatedNutrition,
} from "../utils/utils";
import { DailyFood, DialogueState } from "../utils/models";
import {
  dateOfDailyProductStep,
  nameOfProductStep,
  isAddTheProductStep,
  massOfProductStep,
  combineProductInfoStep,
  isFixingSomethingStep,
  calculateAndAddNutritionStep,
} from "../stepsForScenes/addTodayFoodToBaseSteps";

export const addTodayFoodToBase = new Scenes.WizardScene<Scenes.WizardContext>(
  "ADD_TODAY_FOOD_TO_BASE",

  // start of the dialogue
  async (ctx) => {
    await ctx.reply("Date of daily product in this format: DD.MM.YYYY");
    return ctx.wizard.selectStep(dateOfDailyProductStep);
  },

  // waiting of the date of the daily product
  async (ctx) => {
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
    return ctx.wizard.selectStep(nameOfProductStep);
  },

  // waiting of the name of the product
  async (ctx) => {
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
      return ctx.wizard.selectStep(massOfProductStep);
    }
    await ctx.reply("Product does not exist in database");
    await ctx.reply("Do you want to add it?", yesAndNoButton);
    return ctx.wizard.selectStep(isAddTheProductStep);
  },

  // waiting for "yes" or "no" answer of adding the product
  async (ctx) => {
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
  },

  // waiting for the mass of the product
  async (ctx) => {
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
    return ctx.wizard.selectStep(combineProductInfoStep);
  },

  // combine the saved product information into one message
  async (ctx) => {
    await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 5
    const productInfo = `
      Date: ${(ctx.wizard.state as DailyFood).dateOfDaily}
      Product Name: ${(ctx.wizard.state as DailyFood).name}
      Mass: ${(ctx.wizard.state as DailyFood).mass + " g"}`;

    await ctx.reply(productInfo);

    await ctx.reply("Do you want to fix something?", yesAndNoButton);
    return ctx.wizard.selectStep(isFixingSomethingStep);
  },

  // waiting for "yes" or "no" answer of fixing something
  async (ctx) => {
    await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 6
    const succesButton = yesOrNoButton(ctx);
    await ctx.answerCbQuery(undefined);
    if (succesButton) {
      await ctx.reply("Date of daily product in this format: DD.MM.YYYY");
      return ctx.wizard.selectStep(dateOfDailyProductStep);
    }
    await ctx.reply("Press Next to calculate nutrition", nextStep);
    return ctx.wizard.selectStep(calculateAndAddNutritionStep);
  },

  // final step to calculate nutrition and add it to the daily statistics
  async (ctx) => {
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
);
