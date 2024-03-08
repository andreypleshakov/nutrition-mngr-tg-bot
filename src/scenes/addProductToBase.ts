import { Scenes } from "telegraf";
import { DialogueState, FoodElement } from "../utils/models";
import {
  existenceOfTheSameProduct,
  yesAndNoButton,
  yesOrNoButton,
  textIsNumber,
  replaceProductData,
  addElementToSheet,
  nextStep,
} from "../utils/utils";
import {
  waitingForProductNameStep,
  isReplacingTheProductStep,
  kcalsPerGramStep,
  proteinsPerGramStep,
  saturatedFatPerGramStep,
  unsaturatedFatPerGramStep,
  carbohydratesPerGramStep,
  combineProductInformationStep,
  IsFixingSomethingAndFinalStep,
} from "../stepsForScenes/addProductToBaseSteps";

/////////add product data to product_database
export const addProductToBase = new Scenes.WizardScene<Scenes.WizardContext>(
  "ADD_PRODUCT_TO_BASE",

  // start of the dialogue
  async (ctx) => {
    await ctx.reply("Name of product");
    return ctx.wizard.selectStep(waitingForProductNameStep);
  },

  // waiting of the name of the product
  async (ctx) => {
    if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
      return;
    }
    const productName = ctx.message.text;
    if (ctx.message.text === undefined) {
      await ctx.reply("Wrong, write a product name");
      return;
    }

    (ctx.wizard.state as DialogueState).name = ctx.message.text;

    if (await existenceOfTheSameProduct(productName)) {
      await ctx.reply("Product already exists");
      await ctx.reply("Do you want to replace it?", yesAndNoButton);

      return ctx.wizard.selectStep(isReplacingTheProductStep);
    }
    await ctx.reply("Product name is saved");

    await ctx.reply("Calories per 1 gram");
    return ctx.wizard.selectStep(kcalsPerGramStep);
  },

  // waiting for "yes" or "no" answer of replacing the product
  async (ctx) => {
    const succesButton = yesOrNoButton(ctx);
    await ctx.answerCbQuery(undefined);
    if (succesButton) {
      (ctx.wizard.state as DialogueState).updateProduct = true;

      await ctx.reply("Updating existing product");
      await ctx.reply("Calories per 1 gram");
      return ctx.wizard.selectStep(kcalsPerGramStep);
    }
    await ctx.reply("You can't have two equal products in product base");
    await ctx.reply("If you want to enter new product use comman /add_product");
    return await ctx.scene.leave();
  },

  // waiting for the kcals per gram
  async (ctx) => {
    if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
      return;
    }
    if (!textIsNumber(ctx.message.text)) {
      await ctx.reply("Wrong, write a number");
      return;
    }

    await ctx.reply("Calories are saved");

    (ctx.wizard.state as DialogueState).kcal = parseFloat(ctx.message.text);

    await ctx.reply("Proteins per 1 gram");
    return ctx.wizard.selectStep(proteinsPerGramStep);
  },

  // waiting for the proteins per gram
  async (ctx) => {
    if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
      return;
    }
    if (!textIsNumber(ctx.message.text)) {
      await ctx.reply("Wrong, write a number");
      return;
    }

    await ctx.reply("Proteins grams are saved");

    (ctx.wizard.state as DialogueState).protein = parseFloat(ctx.message.text);

    await ctx.reply("Saturated fats per 1 gram");
    return ctx.wizard.selectStep(saturatedFatPerGramStep);
  },

  // waiting for the saturated fat per gram
  async (ctx) => {
    if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
      return;
    }
    if (!textIsNumber(ctx.message.text)) {
      await ctx.reply("Wrong, write a number");
      return;
    }

    await ctx.reply("Saturated fats grams are saved");

    (ctx.wizard.state as DialogueState).saturated_fat = parseFloat(
      ctx.message.text
    );
    await ctx.reply("Unsaturated fats per 1 gram");

    return ctx.wizard.selectStep(unsaturatedFatPerGramStep);
  },

  // waiting for the unsaturated fat per gram
  async (ctx) => {
    if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
      return;
    }
    if (!textIsNumber(ctx.message.text)) {
      await ctx.reply("Wrong, write a number");
      return;
    }

    await ctx.reply("Unsaturated fats grams are saved");

    (ctx.wizard.state as DialogueState).unsaturated_fat = parseFloat(
      ctx.message.text
    );
    await ctx.reply("Carbohydrates per 1 gram");

    return ctx.wizard.selectStep(carbohydratesPerGramStep);
  },

  // waiting for the carbohydrates per gram
  async (ctx) => {
    if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
      return;
    }
    if (!textIsNumber(ctx.message.text)) {
      await ctx.reply("Wrong, write a number");
      return;
    }

    await ctx.reply("Carbohydrates grams are saved");

    (ctx.wizard.state as DialogueState).carbs = parseFloat(ctx.message.text);
    await ctx.reply("Press Next to calculate nutrition", nextStep);
    return ctx.wizard.selectStep(combineProductInformationStep);
  },

  // combine the saved product information into one message
  async (ctx) => {
    await ctx.answerCbQuery(undefined);
    const productInfo = `
      Product Name: ${(ctx.wizard.state as DialogueState).name}
      Calories: ${(ctx.wizard.state as DialogueState).kcal}
      Proteins: ${(ctx.wizard.state as DialogueState).protein}
      Saturated fats: ${(ctx.wizard.state as DialogueState).saturated_fat}
      Unsaturated fats: ${(ctx.wizard.state as DialogueState).unsaturated_fat}
      Carbohydrates: ${(ctx.wizard.state as DialogueState).carbs}`;

    await ctx.reply(productInfo);

    await ctx.reply("Do you want to fix something?", yesAndNoButton);
    return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
  },

  // waiting for "yes" or "no" answer of fixing something and then finish the dialogue
  async (ctx) => {
    const succesButton = yesOrNoButton(ctx);
    await ctx.answerCbQuery(undefined);
    if (succesButton) {
      await ctx.reply("Name of product");
      return ctx.wizard.selectStep(1);
    } else {
      if ((ctx.scene.state as DialogueState).updateProduct) {
        const success = await replaceProductData(
          ctx.wizard.state as FoodElement
        );
        if (success) {
          await ctx.reply("Product data updated in database");
        } else {
          await ctx.reply("Error: Product not found");
        }
        return await ctx.scene.leave();
      } else {
        await addElementToSheet(ctx.wizard.state as FoodElement);
      }
      await ctx.reply("Product is added to database");
      return await ctx.scene.leave();
    }
  }
);
