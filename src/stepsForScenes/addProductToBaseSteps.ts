import { Context, Middleware, Scenes } from "telegraf";
import { DialogueState, FoodElement } from "../utils/models";
import {
  getYesOrNoButton,
  yesOrNoButton,
  textIsNumber,
  replaceProductData,
  addElementToSheet,
  replaceCommaToDot,
  getFixButtonProductBase,
  existenceOfTheSameProduct,
} from "../utils/utils";

export const STEPS: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  waitingForProductName,
  isReplacingTheProduct,
  kcalsPerGram,
  proteinsPerGram,
  saturatedFatPerGram,
  unsaturatedFatPerGram,
  carbohydratesPerGram,
  IsFixingSomethingAndFinal,
  fixingSomethingAndFinal,
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

export const IsFixingSomethingAndFinalStep = STEPS.findIndex(
  (schene) => schene === IsFixingSomethingAndFinal
);

export const fixingSomethingAndFinalStep = STEPS.findIndex(
  (schene) => schene === fixingSomethingAndFinal
);

//////////////////////////////////////

// function: start of the dialogue
async function startingDialogue(ctx: Scenes.WizardContext) {
  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(waitingForProductNameStep);
}

// function: waiting of the name of the product
async function waitingForProductName(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const productName = ctx.message.text.trim();
  if (ctx.message.text === undefined) {
    await ctx.reply("Wrong, write a product name");
    return;
  }

  (ctx.wizard.state as DialogueState).name = ctx.message.text;

  if ((ctx.wizard.state as DialogueState).fromFixingStep) {
    await ctx.reply(
      "Press YES if you want to fix something else or NO if you want to add product to database",
      yesOrNoButton
    );
    return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
  }

  if (await existenceOfTheSameProduct(productName)) {
    await ctx.reply("Product already exists");
    await ctx.reply("Do you want to replace it?", yesOrNoButton);

    return ctx.wizard.selectStep(isReplacingTheProductStep);
  }

  await ctx.reply("Calories per 1 gram");
  return ctx.wizard.selectStep(kcalsPerGramStep);
}

// function: waiting for "yes" or "no" answer of replacing the product
async function isReplacingTheProduct(ctx: Scenes.WizardContext) {
  const succesButton = getYesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);
  if (succesButton) {
    (ctx.wizard.state as DialogueState).updateProduct = true;

    await ctx.reply("Updating existing product");
    await ctx.reply("Calories per 1 gram");
    return ctx.wizard.selectStep(kcalsPerGramStep);
  }
  await ctx.reply("You can't have two equal products in product base");
  await ctx.reply("If you want to enter new product use comman /add_product");
  return ctx.scene.leave();
}

// function: waiting for the kcals per gram
async function kcalsPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  (ctx.wizard.state as DialogueState).kcal = replaceCommaToDot(
    ctx.message.text
  );

  if ((ctx.wizard.state as DialogueState).fromFixingStep) {
    await ctx.reply(
      "Press YES if you want to fix something else or NO if you want to add product to database",
      yesOrNoButton
    );
    return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
  }

  await ctx.reply("Proteins per 1 gram");
  return ctx.wizard.selectStep(proteinsPerGramStep);
}

// function: waiting for the proteins per gram
async function proteinsPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  (ctx.wizard.state as DialogueState).protein = replaceCommaToDot(
    ctx.message.text
  );

  if ((ctx.wizard.state as DialogueState).fromFixingStep) {
    await ctx.reply(
      "Press YES if you want to fix something else or NO if you want to add product to database",
      yesOrNoButton
    );
    return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
  }

  await ctx.reply("Saturated fats per 1 gram");
  return ctx.wizard.selectStep(saturatedFatPerGramStep);
}

// function: waiting for the saturated fat per gram
async function saturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  (ctx.wizard.state as DialogueState).saturated_fat = replaceCommaToDot(
    ctx.message.text
  );

  if ((ctx.wizard.state as DialogueState).fromFixingStep) {
    await ctx.reply(
      "Press YES if you want to fix something else or NO if you want to add product to database",
      yesOrNoButton
    );
    return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
  }

  await ctx.reply("Unsaturated fats per 1 gram");
  return ctx.wizard.selectStep(unsaturatedFatPerGramStep);
}

// function: waiting for the unsaturated fat per gram
async function unsaturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  (ctx.wizard.state as DialogueState).unsaturated_fat = replaceCommaToDot(
    ctx.message.text
  );

  if ((ctx.wizard.state as DialogueState).fromFixingStep) {
    await ctx.reply(
      "Press YES if you want to fix something else or NO if you want to add product to database",
      yesOrNoButton
    );
    return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
  }

  await ctx.reply("Carbohydrates per 1 gram");
  return ctx.wizard.selectStep(carbohydratesPerGramStep);
}

// function: waiting for the carbohydrates per gram
async function carbohydratesPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  (ctx.wizard.state as DialogueState).carbs = replaceCommaToDot(
    ctx.message.text
  );

  if ((ctx.wizard.state as DialogueState).fromFixingStep) {
    await ctx.reply(
      "Press YES if you want to fix something else or NO if you want to add product to database",
      yesOrNoButton
    );
    return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
  }

  const actualState = ctx.wizard.state as DialogueState;

  console.log(actualState);

  const productInfo = `
    Product Name: ${actualState.name}
    Calories: ${actualState.kcal}
    Proteins: ${actualState.protein}
    Saturated fats: ${actualState.saturated_fat}
    Unsaturated fats: ${actualState.unsaturated_fat}
    Carbohydrates: ${actualState.carbs}`;

  await ctx.reply(productInfo);

  await ctx.reply("Do you want to fix something?", yesOrNoButton);
  return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
}

// function: waiting for "yes" or "no" answer of fixing something and then finish the dialogue
async function IsFixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  const actualState = ctx.wizard.state as FoodElement;

  if (!(ctx.wizard.state as DialogueState).fromFixingStep) {
    const fixButtonProductBase = getFixButtonProductBase(actualState);

    const succesButton = getYesOrNoButton(ctx);
    await ctx.answerCbQuery(undefined);

    if (succesButton) {
      await ctx.reply("Choose what you want ot fix", fixButtonProductBase);
      return ctx.wizard.selectStep(fixingSomethingAndFinalStep);
    }
  }
  if ((ctx.scene.state as DialogueState).updateProduct) {
    await replaceProductData(actualState);
    await ctx.reply("Product data updated in database");
    return ctx.scene.leave();
  }

  await addElementToSheet(actualState);
  await ctx.reply("Product is added to database");
  return ctx.scene.leave();
}

// function: fixing something and then finish the dialogue
async function fixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  (ctx.wizard.state as DialogueState).fromFixingStep = true;

  const actualState = ctx.wizard.state as FoodElement;

  const callBackData = ctx.callbackQuery.data;

  // there is an issue with all cases

  if (ctx.callbackQuery !== undefined) {
    await ctx.answerCbQuery();

    switch (callBackData) {
      case actualState.name:
        return ctx.wizard.selectStep(startingDialogueStep);
      case `${actualState.kcal}`:
        await ctx.reply("Calories per 1 gram");
        return ctx.wizard.selectStep(kcalsPerGramStep);
      case `${actualState.protein}`:
        await ctx.reply("Proteins per 1 gram");
        return ctx.wizard.selectStep(proteinsPerGramStep);
      case `${actualState.saturated_fat}`:
        await ctx.reply("Saturated fats per 1 gram");
        return ctx.wizard.selectStep(saturatedFatPerGramStep);
      case `${actualState.unsaturated_fat}`:
        await ctx.reply("Unsaturated fats per 1 gram");
        return ctx.wizard.selectStep(unsaturatedFatPerGramStep);
      case `${actualState.carbs}`:
        await ctx.reply("Carbohydrates per 1 gram");
        return ctx.wizard.selectStep(carbohydratesPerGramStep);
    }
  }
}
