import { Middleware, Scenes } from "telegraf";
import { DialogueState, FoodElement } from "../utils/models";
import {
  isValidNumberString,
  replaceCommaToDot,
  doesExistTheSameProductWithTgId,
  handleFromFixingStep,
  createOrUpdateProductInProductBase,
  calculateAndRoundNutrient,
  roundToThree,
} from "../utils/utils";
import {
  getYesOrNoButton,
  yesOrNoButton,
  fixButtonProductBase,
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
  IsFixingSomethingAndFinal,
  fixingSomethingAndFinal,
  perHundredOrCustomMass,
  customMass,
  totalFatPerGram,
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

export const IsFixingSomethingAndFinalStep = createProductSteps.findIndex(
  (scene) => scene === IsFixingSomethingAndFinal
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

//////////////////////////////////////

export const createProduct = new Scenes.WizardScene<Scenes.WizardContext>(
  "CREATE_PRODUCT",
  ...createProductSteps
);

// start of the dialogue
export async function startingDialogue(ctx: Scenes.WizardContext) {
  (ctx.wizard.state as FoodElement).tgId = ctx.from!.id;

  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(waitingForProductNameStep);
}

// waiting of the name of the product
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

//waiting for choose scope of mass of nutrition
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

// waiting for "yes" or "no" answer of replacing the product (step: 2)
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

// waiting for the kcals per gram
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

// waiting for the proteins per gram
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

//waitnig for total fat per gram
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

// waiting for the saturated fat per gram
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

  const customMass = (ctx.wizard.state as DialogueState).customMass;

  actualState.saturated_fat = replaceCommaToDot(ctx.message.text);
  actualState.unsaturated_fat =
    actualState.totalFat - actualState.saturated_fat;

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  await ctx.reply(`Carbohydrates per ${customMass} gram`);
  return ctx.wizard.selectStep(carbohydratesPerGramStep);
}

// waiting for the unsaturated fat per gram
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

  await ctx.reply(`Carbohydrates fats per ${customMass} gram`);
  return ctx.wizard.selectStep(carbohydratesPerGramStep);
}

// waiting for the carbohydrates per gram
export async function carbohydratesPerGram(ctx: Scenes.WizardContext) {
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

  actualState.carbs = replaceCommaToDot(ctx.message.text);

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return;
  }

  const productInfo = `
  Product Name: ${actualState.name}
  Nutritions per ${customMass} gram:
    Calories: ${actualState.kcal}
    Proteins: ${actualState.protein}
    Total fat: ${actualState.totalFat}:
      Saturated fats: ${actualState.saturated_fat}
      Unsaturated fats: ${roundToThree(actualState.unsaturated_fat)}
    Carbohydrates: ${actualState.carbs}`;

  await ctx.reply(productInfo);

  await ctx.reply("Do you want to fix something?", yesOrNoButton);
  return ctx.wizard.selectStep(IsFixingSomethingAndFinalStep);
}

// waiting for "yes" or "no" answer of fixing something or finish the dialogue
export async function IsFixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  const succesButton = getYesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);

  if (succesButton) {
    await ctx.reply("Choose what you want ot fix", fixButtonProductBase);
    return ctx.wizard.selectStep(fixingSomethingAndFinalStep);
  }

  const actualState = ctx.wizard.state as FoodElement;
  const customMass = (ctx.wizard.state as DialogueState).customMass;
  const updateCheck = (ctx.scene.state as DialogueState).updateProduct;

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
  ];

  nutrientKeys.forEach((nutrientKey) => {
    actualState[nutrientKey] = calculateAndRoundNutrient(
      actualState[nutrientKey],
      customMass
    );
  });

  await createOrUpdateProductInProductBase(actualState, updateCheck, ctx);
}

// fixing something and then finish the dialogue
export async function fixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const customMass = (ctx.wizard.state as DialogueState).customMass;

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
  }
}
