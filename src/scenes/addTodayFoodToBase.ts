import { Scenes } from "telegraf";
import {
  isValidDateFormat,
  existenceOfTheSameProduct,
  getYesOrNoButton,
  yesOrNoButton,
  textIsNumber,
  calculateNutrition,
  addCalculatedNutrition,
  replaceCommaToDot,
} from "../utils/utils";
import { DailyFood, DialogueState } from "../utils/models";
import {
  dateOfDailyProductStep,
  nameOfProductStep,
  isAddTheProductStep,
  massOfProductStep,
  isFixingSomethingStep,
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
  },

  // waiting of the name of the product
  async (ctx) => {
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
  },

  // waiting for "yes" or "no" answer of adding the product
  async (ctx) => {
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
  },

  // waiting for the mass of the product
  async (ctx) => {
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
  },

  // waiting for "yes" or "no" answer of fixing something and finish stage
  async (ctx) => {
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
      console.log(nutrition);

      if (nutrition) {
        await addCalculatedNutrition(nutrition, date);
      }
    }

    await ctx.reply("Product is calculated and added to daily statistics");
    return ctx.scene.leave();
  }
);
