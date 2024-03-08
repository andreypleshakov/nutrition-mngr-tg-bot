import { Scenes } from "telegraf";
import { DialogueState, FoodElement } from "../utils/models";
import {
  yesAndNoButton,
  yesOrNoButton,
  textIsNumber,
  replaceProductData,
  addElementToSheet,
  nextStep,
} from "../utils/utils";

const STEPS = [
  startingDialogue,
  waitingForProductName,
  isReplacingTheProduct,
  kcalsPerGram,
  proteinsPerGram,
  saturatedFatPerGram,
  unsaturatedFatPerGram,
  carbohydratesPerGram,
  combineProductInformation,
  IsFixingSomethingAndFinal,
];

export const startingDialogueStep = STEPS.findIndex(
  (schene) => schene === startingDialogue
);

export const waitingForProductNameStep = STEPS.findIndex(
  (schene) => schene === waitingForProductName
);

export const isReplacingTheProductStep = STEPS.findIndex(
  (schene) => schene === isReplacingTheProduct
);

export const kcalsPerGramStep = STEPS.findIndex(
  (schene) => schene === kcalsPerGram
);

export const proteinsPerGramStep = STEPS.findIndex(
  (schene) => schene === proteinsPerGram
);

export const saturatedFatPerGramStep = STEPS.findIndex(
  (schene) => schene === saturatedFatPerGram
);

export const unsaturatedFatPerGramStep = STEPS.findIndex(
  (schene) => schene === unsaturatedFatPerGram
);

export const carbohydratesPerGramStep = STEPS.findIndex(
  (schene) => schene === carbohydratesPerGram
);

export const combineProductInformationStep = STEPS.findIndex(
  (schene) => schene === combineProductInformation
);

export const IsFixingSomethingAndFinalStep = STEPS.findIndex(
  (schene) => schene === IsFixingSomethingAndFinal
);

//////////////////////////////////////

// function: start of the dialogue
async function startingDialogue(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 0
  await ctx.reply("Name of product");
  return ctx.wizard.next();
}

// function: waiting of the name of the product
async function waitingForProductName(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 1
  const productName = ctx.message.text;
  if (ctx.message.text === undefined) {
    await ctx.reply("Wrong, write a product name");
    return;
  }
}

// function: waiting for "yes" or "no" answer of replacing the product
async function isReplacingTheProduct(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 2
  const succesButton = yesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);
  if (succesButton) {
    (ctx.wizard.state as DialogueState).updateProduct = true;

    await ctx.reply("Updating existing product");
    await ctx.reply("Calories per 1 gram");
    return ctx.wizard.next();
  }
  await ctx.reply("You can't have two equal products in product base");
  await ctx.reply("If you want to enter new product use comman /add_product");
  return await ctx.scene.leave();
}

// function: waiting for the kcals per gram
async function kcalsPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 3
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Calories are saved");

  (ctx.wizard.state as DialogueState).kcal = parseFloat(ctx.message.text);

  await ctx.reply("Proteins per 1 gram");
  return ctx.wizard.next();
}

// function: waiting for the proteins per gram
async function proteinsPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 4
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Proteins grams are saved");

  (ctx.wizard.state as DialogueState).protein = parseFloat(ctx.message.text);

  await ctx.reply("Saturated fats per 1 gram");
  return ctx.wizard.next();
}

// function: waiting for the saturated fat per gram
async function saturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 5
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Saturated fats grams are saved");

  (ctx.wizard.state as DialogueState).saturated_fat = parseFloat(
    ctx.message.text
  );
  await ctx.reply("Unsaturated fats per 1 gram");

  return ctx.wizard.next();
}

// function: waiting for the unsaturated fat per gram
async function unsaturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 6
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Unsaturated fats grams are saved");

  (ctx.wizard.state as DialogueState).unsaturated_fat = parseFloat(
    ctx.message.text
  );
  await ctx.reply("Carbohydrates per 1 gram");

  return ctx.wizard.next();
}

// function: waiting for the carbohydrates per gram
async function carbohydratesPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || (ctx.message && !("text" in ctx.message))) {
    return;
  }
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 7
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Carbohydrates grams are saved");

  (ctx.wizard.state as DialogueState).carbs = parseFloat(ctx.message.text);
  await ctx.reply("Press Next to calculate nutrition", nextStep);
  return ctx.wizard.next();
}

// function: combine the saved product information into one message
async function combineProductInformation(ctx: Scenes.WizardContext) {
  await ctx.answerCbQuery(undefined);
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 8
  const productInfo = `
        Product Name: ${(ctx.wizard.state as DialogueState).name}
        Calories: ${(ctx.wizard.state as DialogueState).kcal}
        Proteins: ${(ctx.wizard.state as DialogueState).protein}
        Saturated fats: ${(ctx.wizard.state as DialogueState).saturated_fat}
        Unsaturated fats: ${(ctx.wizard.state as DialogueState).unsaturated_fat}
        Carbohydrates: ${(ctx.wizard.state as DialogueState).carbs}`;

  await ctx.reply(productInfo);

  await ctx.reply("Do you want to fix something?", yesAndNoButton);
  return ctx.wizard.next();
}

// function: waiting for "yes" or "no" answer of fixing something and then finish the dialogue
async function IsFixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 9
  const succesButton = yesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);
  if (succesButton) {
    await ctx.reply("Name of product");
    return ctx.wizard.selectStep(1);
  } else {
    if ((ctx.scene.state as DialogueState).updateProduct) {
      const success = await replaceProductData(ctx.wizard.state as FoodElement);
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
