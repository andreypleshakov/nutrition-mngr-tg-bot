import { Context, Middleware, Scenes } from "telegraf";
import { DialogueState, FoodElement } from "../utils/models";
import {
  yesAndNoButton,
  yesOrNoButton,
  textIsNumber,
  replaceProductData,
  addElementToSheet,
  replaceCommaToDot,
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
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 0
  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(waitingForProductNameStep);
}

// function: waiting of the name of the product
async function waitingForProductName(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 1
  const productName = ctx.message.text.trim();
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
  return ctx.scene.leave();
}

// function: waiting for the kcals per gram
async function kcalsPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 3
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  console.log(ctx.wizard.state as DialogueState),
    ((ctx.wizard.state as DialogueState).kcal = replaceCommaToDot(
      ctx.message.text
    ));

  await ctx.reply("Calories are saved");

  await ctx.reply("Proteins per 1 gram");
  return ctx.wizard.next();
}

// function: waiting for the proteins per gram
async function proteinsPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 4
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Proteins grams are saved");

  (ctx.wizard.state as DialogueState).protein = replaceCommaToDot(
    ctx.message.text
  );

  await ctx.reply("Saturated fats per 1 gram");
  return ctx.wizard.next();
}

// function: waiting for the saturated fat per gram
async function saturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 5
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Saturated fats grams are saved");

  (ctx.wizard.state as DialogueState).saturated_fat = replaceCommaToDot(
    ctx.message.text
  );
  await ctx.reply("Unsaturated fats per 1 gram");

  return ctx.wizard.next();
}

// function: waiting for the unsaturated fat per gram
async function unsaturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 6
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Unsaturated fats grams are saved");

  (ctx.wizard.state as DialogueState).unsaturated_fat = replaceCommaToDot(
    ctx.message.text
  );
  await ctx.reply("Carbohydrates per 1 gram");

  return ctx.wizard.next();
}

// function: waiting for the carbohydrates per gram
async function carbohydratesPerGram(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 7
  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  await ctx.reply("Carbohydrates grams are saved");

  (ctx.wizard.state as DialogueState).carbs = replaceCommaToDot(
    ctx.message.text
  );

  const actualState = ctx.wizard.state as DialogueState;

  const productInfo = `
      Product Name: ${actualState.name}
      Calories: ${actualState.kcal}
      Proteins: ${actualState.protein}
      Saturated fats: ${actualState.saturated_fat}
      Unsaturated fats: ${actualState.unsaturated_fat}
      Carbohydrates: ${actualState.carbs}`;

  await ctx.reply(productInfo);

  await ctx.reply("Do you want to fix something?", yesAndNoButton);
  return ctx.wizard.next();
}

// function: waiting for "yes" or "no" answer of fixing something and then finish the dialogue
async function IsFixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 8

  const actualState = ctx.wizard.state as FoodElement;

  const fixButtonProductBase = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Product Name", callback_data: `${actualState.name}` },
          { text: "Calories", callback_data: `${actualState.kcal}` },
          { text: "Proteins", callback_data: `${actualState.protein}` },
          {
            text: "Saturated fats",
            callback_data: `${actualState.saturated_fat}`,
          },
          {
            text: "Unsaturated fats",
            callback_data: `${actualState.unsaturated_fat}`,
          },
          { text: "Carbohydrates", callback_data: `${actualState.carbs}` },
        ],
      ],
    },
  };

  const succesButton = yesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);

  if (succesButton) {
    await ctx.reply("Choose what you want ot fix", fixButtonProductBase);
    return ctx.wizard.selectStep(9);
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
  await ctx.reply(`Index: ${ctx.wizard.cursor}`); // Step: 9

  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;

  const callBackData = ctx.callbackQuery.data;

  if (ctx.callbackQuery !== undefined) {
    await ctx.answerCbQuery(undefined);

    switch (callBackData) {
      case `${actualState.name}`:
        return ctx.wizard.selectStep(0);
      case `${actualState.kcal}`:
        await ctx.reply("Calories per 1 gram");
        return ctx.wizard.selectStep(3);
      case `${actualState.protein}`:
        await ctx.reply("Proteins per 1 gram");
        return ctx.wizard.selectStep(4);
      case `${actualState.saturated_fat}`:
        await ctx.reply("Saturated fats per 1 gram");
        return ctx.wizard.selectStep(5);
      case `${actualState.unsaturated_fat}`:
        await ctx.reply("Unsaturated fats per 1 gram");
        return ctx.wizard.selectStep(6);
      case `${actualState.carbs}`:
        await ctx.reply("Carbohydrates per 1 gram");
        return ctx.wizard.selectStep(7);
    }
  }
}
