import { Middleware, Scenes } from "telegraf";
import { DialogueState, FoodElement } from "../utils/models";
import {
  isValidNumberString,
  replaceCommaToDot,
  doesExistTheSameProductWithTgId,
  handleFromFixingStep,
  createOrUpdateProductInProductBase,
  calculateAndRoundNutrient,
} from "../utils/utils";
import {
  getYesOrNoButton,
  yesOrNoButton,
  getfixButtonProductBase,
  perButton,
} from "../utils/buttons";

export const createProductSteps: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  waitingForProductName,
  isUpdatingTheProduct,
  kcalsPerGram,
  proteinsPerGram,
  saturatedFatPerGram,
  unsaturatedFatPerGram,
  carbohydratesPerGram,
  fixingSomethingAndFinal,
  perHundredOrCustomMass,
  customMass,
  totalFatPerGram,
  fiberPerGram,
];

export const startingDialogueStep = createProductSteps.findIndex(
  (scene) => scene === startingDialogue
);

export const waitingForProductNameStep = createProductSteps.findIndex(
  (scene) => scene === waitingForProductName
);

export const isUpdatingTheProductStep = createProductSteps.findIndex(
  (scene) => scene === isUpdatingTheProduct
);

export const kcalsPerGramStep = createProductSteps.findIndex(
  (scene) => scene === kcalsPerGram
);

export const proteinsPerGramStep = createProductSteps.findIndex(
  (scene) => scene === proteinsPerGram
);

export const saturatedFatPerGramStep = createProductSteps.findIndex(
  (scene) => scene === saturatedFatPerGram
);

export const unsaturatedFatPerGramStep = createProductSteps.findIndex(
  (scene) => scene === unsaturatedFatPerGram
);

export const carbohydratesPerGramStep = createProductSteps.findIndex(
  (scene) => scene === carbohydratesPerGram
);
export const fixingSomethingAndFinalStep = createProductSteps.findIndex(
  (scene) => scene === fixingSomethingAndFinal
);

export const perHundredOrCustomMassStep = createProductSteps.findIndex(
  (scene) => scene === perHundredOrCustomMass
);
createProductSteps;

export const customMassStep = createProductSteps.findIndex(
  (scene) => scene === customMass
);

export const totalFatPerGramStep = createProductSteps.findIndex(
  (scene) => scene === totalFatPerGram
);

const fiberPerGramStep = createProductSteps.findIndex(
  (scene) => scene === fiberPerGram
);
//////////////////////////////////////

export const createProduct = new Scenes.WizardScene<Scenes.WizardContext>(
  "CREATE_PRODUCT",
  ...createProductSteps
);

export async function startingDialogue(ctx: Scenes.WizardContext) {
  (ctx.wizard.state as FoodElement).tgId = ctx.from!.id;

  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(waitingForProductNameStep);
}

export async function waitingForProductName(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Wrong, write a product name");
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;
  actualState.name = ctx.message.text.trim();
  const productName = actualState.name;
  const tgId = actualState.tgId;

  const existance = await doesExistTheSameProductWithTgId(productName, tgId);

  if (existance) {
    await ctx.reply("Product already exists");
    await ctx.reply("Do you want to update it?", yesOrNoButton);

    return ctx.wizard.selectStep(isUpdatingTheProductStep);
  }

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  await ctx.reply(
    "Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM",
    perButton
  );
  return ctx.wizard.selectStep(perHundredOrCustomMassStep);
}

export async function perHundredOrCustomMass(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "100-gram") {
    (ctx.wizard.state as DialogueState).customMass = 100;
    await ctx.reply("Calories per 100 gram");
    return ctx.wizard.selectStep(kcalsPerGramStep);
  } else if (callBackData === "custom-mass") {
    await ctx.reply("Enter mass that you want to calculate");
    return ctx.wizard.selectStep(customMassStep);
  }
}

export async function customMass(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = replaceCommaToDot(ctx.message.text);

  if (customMass === 0) {
    await ctx.reply("Enter mass that greater than 0");
    return;
  }

  (ctx.wizard.state as DialogueState).customMass = customMass;

  await ctx.reply(`Calories per ${customMass} gram`);
  return ctx.wizard.selectStep(kcalsPerGramStep);
}

export async function isUpdatingTheProduct(ctx: Scenes.WizardContext) {
  const succesButton = getYesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);

  if (succesButton) {
    (ctx.wizard.state as DialogueState).updateProduct = true;

    await ctx.reply("Updating existing product");
    await ctx.reply(
      "Choose per what mass you want to calculate nutrition PER 100 or PER CUSTOM",
      perButton
    );
    return ctx.wizard.selectStep(perHundredOrCustomMassStep);
  }

  await ctx.reply("You can't have two equal products in product base");
  await ctx.reply(
    "If you want to enter new product use comman /start_calculation"
  );
  return ctx.scene.enter("START_CALCULATION");
}

export async function kcalsPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  (ctx.wizard.state as FoodElement).kcal = replaceCommaToDot(ctx.message.text);
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  await ctx.reply(`Proteins per ${customMass} gram`);
  return ctx.wizard.selectStep(proteinsPerGramStep);
}

export async function proteinsPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  (ctx.wizard.state as FoodElement).protein = replaceCommaToDot(
    ctx.message.text
  );
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  await ctx.reply(`Total fats per ${customMass} gram`);
  return ctx.wizard.selectStep(totalFatPerGramStep);
}

export async function totalFatPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;
  const customMass = (ctx.wizard.state as DialogueState).customMass;
  actualState.totalFat = replaceCommaToDot(ctx.message.text);
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  if (actualState.totalFat === 0) {
    actualState.saturated_fat = 0;
    actualState.unsaturated_fat = 0;
    await ctx.reply(`Carbohydrates per ${customMass} gram`);
    return ctx.wizard.selectStep(carbohydratesPerGramStep);
  }

  await ctx.reply(`Saturated fats per ${customMass} gram`);
  return ctx.wizard.selectStep(saturatedFatPerGramStep);
}

export async function saturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;
  actualState.saturated_fat = replaceCommaToDot(ctx.message.text);

  if (actualState.saturated_fat > actualState.totalFat) {
    await ctx.reply(
      "Wrong, saturated fat mass can`t be more than total fat mass"
    );
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;

  actualState.unsaturated_fat = Math.round(
    actualState.totalFat - actualState.saturated_fat
  );

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  await ctx.reply(`Carbohydrates per ${customMass} gram`);
  return ctx.wizard.selectStep(carbohydratesPerGramStep);
}

export async function unsaturatedFatPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  const actualState = ctx.wizard.state as FoodElement;
  actualState.unsaturated_fat = replaceCommaToDot(ctx.message.text);

  actualState.totalFat =
    actualState.saturated_fat + actualState.unsaturated_fat;

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  await ctx.reply(`Carbohydrates per ${customMass} gram`);
  return ctx.wizard.selectStep(carbohydratesPerGramStep);
}

export async function carbohydratesPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  const actualState = ctx.wizard.state as FoodElement;
  actualState.carbs = replaceCommaToDot(ctx.message.text);
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  await ctx.reply(`Fiber per ${customMass} gram`);
  return ctx.wizard.selectStep(fiberPerGramStep);
}

export async function fiberPerGram(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const actualState = ctx.wizard.state as FoodElement;
  actualState.fiber = replaceCommaToDot(ctx.message.text);
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  const fixButtonProductBase = getfixButtonProductBase(actualState);

  await ctx.reply(
    "Choose what you want ot fix or press done to create product",
    fixButtonProductBase
  );
  return ctx.wizard.selectStep(fixingSomethingAndFinalStep);
}

export async function fixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;
  const actualState = ctx.wizard.state as FoodElement;
  const updateCheck = (ctx.scene.state as DialogueState).updateProduct;
  (ctx.wizard.state as DialogueState).fromFixingStep = true;

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  switch (callBackData) {
    case "name":
      await ctx.reply("Name of product");
      return ctx.wizard.selectStep(waitingForProductNameStep);
    case "kcal":
      await ctx.reply(`Calories per ${customMass} gram`);
      return ctx.wizard.selectStep(kcalsPerGramStep);
    case "protein":
      await ctx.reply(`Proteins per ${customMass} gram`);
      return ctx.wizard.selectStep(proteinsPerGramStep);
    case "total-fat":
      await ctx.reply(`Total fats per ${customMass}`);
      return ctx.wizard.selectStep(totalFatPerGramStep);
    case "saturated-fat":
      await ctx.reply(`Saturated fats per ${customMass} gram`);
      return ctx.wizard.selectStep(saturatedFatPerGramStep);
    case "unsaturated-fat":
      await ctx.reply(`Unsaturated fats per ${customMass} gram`);
      return ctx.wizard.selectStep(unsaturatedFatPerGramStep);
    case "carbs":
      await ctx.reply(`Carbohydrates per ${customMass} gram`);
      return ctx.wizard.selectStep(carbohydratesPerGramStep);
    case "fiber":
      await ctx.reply(`Fiber per ${customMass} gram`);
      return ctx.wizard.selectStep(fiberPerGramStep);
    case "done":
      type NutrientKeys = Exclude<
        keyof FoodElement,
        "name" | "tgId" | "documentId" | "tgUserName" | "_id"
      >;

      const nutrientKeys: NutrientKeys[] = [
        "kcal",
        "protein",
        "totalFat",
        "saturated_fat",
        "unsaturated_fat",
        "carbs",
        "fiber",
      ];

      nutrientKeys.forEach((nutrientKey) => {
        actualState[nutrientKey] = calculateAndRoundNutrient(
          actualState[nutrientKey],
          customMass
        );
      });

      await createOrUpdateProductInProductBase(actualState, updateCheck, ctx);
  }
}