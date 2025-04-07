import { Scenes } from "telegraf";
import { IDialogueState, IProduct, InitialState } from "../utils/models";
import {
  isValidNumber,
  doesExistTheSameProductWithTgId,
  handleFromFixingStep,
  createOrUpdateProductInProductBase,
  calculateAndRoundNutrient,
  handleFromStartingScene,
  updateProductMeal,
  isSaturBiggerThanTotal,
} from "../utils/utils";
import {
  yesOrNoButton,
  getfixButtonProductBase,
  perButton,
} from "../utils/buttons";
import {
  steps,
  createProductStepsList,
} from "../steps-middlewares/createProductSteps";

export const createProduct = new Scenes.WizardScene<Scenes.WizardContext>(
  "CREATE_PRODUCT",
  ...createProductStepsList
);

export async function startingDialogue(ctx: Scenes.WizardContext) {
  if (!(ctx.scene.state as InitialState).fromStartingScene) {
    return await handleFromStartingScene(ctx);
  }

  (ctx.wizard.state as IProduct).tgId = ctx.from!.id;

  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(steps.waitingForProductName);
}

export async function waitingForProductName(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Wrong, write a product name");
    return;
  }

  const actualState = ctx.wizard.state as IProduct;
  actualState.name = ctx.message.text.trim().toLowerCase();
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  const existance = await doesExistTheSameProductWithTgId(
    actualState.name,
    actualState.tgId
  );

  if (existance) {
    await ctx.reply("Product already exists");
    await ctx.reply("Do you want to update it?", yesOrNoButton);
    return ctx.wizard.selectStep(steps.isUpdatingTheProduct);
  }

  await ctx.reply(
    "Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM",
    perButton
  );
  return ctx.wizard.selectStep(steps.perHundredOrCustomMass);
}

export async function perHundredOrCustomMass(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "100-gram") {
    (ctx.wizard.state as IDialogueState).customMass = 100;
    await ctx.reply("Calories per 100 gram");
    return ctx.wizard.selectStep(steps.kcalsPerGram);
  } else if (callBackData === "custom-mass") {
    await ctx.reply("Enter mass that you want to calculate");
    return ctx.wizard.selectStep(steps.customMass);
  }
}

export async function customMass(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (!validNumber) return;

  const customMass = validNumber;

  if (customMass === 0) {
    await ctx.reply("Enter mass that greater than 0");
    return;
  }

  (ctx.wizard.state as IDialogueState).customMass = customMass;

  await ctx.reply(`Calories per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.kcalsPerGram);
}

export async function isUpdatingTheProduct(ctx: Scenes.WizardContext) {
  await updateProductMeal(ctx, steps.perHundredOrCustomMass, "Product");
}

export async function kcalsPerGram(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (!validNumber) return;

  const customMass = (ctx.wizard.state as IDialogueState).customMass;
  (ctx.wizard.state as IProduct).kcal = validNumber;
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Proteins per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.proteinsPerGram);
}

export async function proteinsPerGram(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (!validNumber) return;

  const customMass = (ctx.wizard.state as IDialogueState).customMass;
  (ctx.wizard.state as IProduct).protein = validNumber;
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Total fats per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.totalFatPerGram);
}

export async function totalFatPerGram(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (!validNumber) return;

  const actualState = ctx.wizard.state as IProduct;
  const customMass = (ctx.wizard.state as IDialogueState).customMass;
  actualState.totalFat = validNumber;
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  if (actualState.totalFat === 0) {
    actualState.saturatedFat = 0;
    actualState.unsaturatedFat = 0;
    await ctx.reply(`Carbohydrates per ${customMass} gram`);
    return ctx.wizard.selectStep(steps.carbohydratesPerGram);
  }

  await ctx.reply(`Saturated fats per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.saturatedFatPerGram);
}

export async function saturatedFatPerGram(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (!validNumber) return;

  const actualState = ctx.wizard.state as IProduct;
  actualState.saturatedFat = validNumber;

  if (!(await isSaturBiggerThanTotal(ctx))) return;

  const customMass = (ctx.wizard.state as IDialogueState).customMass;

  actualState.unsaturatedFat = Math.round(
    actualState.totalFat - actualState.saturatedFat
  );

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Carbohydrates per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.carbohydratesPerGram);
}

export async function unsaturatedFatPerGram(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (!validNumber) return;

  const customMass = (ctx.wizard.state as IDialogueState).customMass;
  const actualState = ctx.wizard.state as IProduct;
  actualState.unsaturatedFat = validNumber;

  actualState.totalFat = actualState.saturatedFat + actualState.unsaturatedFat;

  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Carbohydrates per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.carbohydratesPerGram);
}

export async function carbohydratesPerGram(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (!validNumber) return;

  const customMass = (ctx.wizard.state as IDialogueState).customMass;
  const actualState = ctx.wizard.state as IProduct;
  actualState.carbs = validNumber;
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  await ctx.reply(`Fiber per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.fiberPerGram);
}

export async function fiberPerGram(ctx: Scenes.WizardContext) {
  const validNumber = await isValidNumber(ctx);
  if (!validNumber) return;

  const actualState = ctx.wizard.state as IProduct;
  actualState.fiber = validNumber;
  const fromFixingStep = await handleFromFixingStep(ctx);

  if (fromFixingStep) {
    return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
  }

  const fixButtonProductBase = getfixButtonProductBase(actualState);

  await ctx.reply(
    "Choose what you want ot fix or press done to create product",
    fixButtonProductBase
  );
  return ctx.wizard.selectStep(steps.fixingSomethingAndFinal);
}

export async function fixingSomethingAndFinal(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const customMass = (ctx.wizard.state as IDialogueState).customMass;
  const actualState = ctx.wizard.state as IProduct;
  const updateCheck = (ctx.scene.state as IDialogueState).updateProduct;
  (ctx.wizard.state as IDialogueState).fromFixingStep = true;

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  switch (callBackData) {
    case "name":
      await ctx.reply("Name of product");
      return ctx.wizard.selectStep(steps.waitingForProductName);
    case "kcal":
      await ctx.reply(`Calories per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.kcalsPerGram);
    case "protein":
      await ctx.reply(`Proteins per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.proteinsPerGram);
    case "total-fat":
      await ctx.reply(`Total fats per ${customMass}`);
      return ctx.wizard.selectStep(steps.totalFatPerGram);
    case "saturated-fat":
      await ctx.reply(`Saturated fats per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.saturatedFatPerGram);
    case "unsaturated-fat":
      await ctx.reply(`Unsaturated fats per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.unsaturatedFatPerGram);
    case "carbs":
      await ctx.reply(`Carbohydrates per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.carbohydratesPerGram);
    case "fiber":
      await ctx.reply(`Fiber per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.fiberPerGram);
    case "done":
      type NutrientKeys = Exclude<
        keyof IProduct,
        | "name"
        | "tgId"
        | "documentId"
        | "tgUserName"
        | "_id"
        | "status"
        | "typeOfFood"
      >;

      const nutrientKeys: NutrientKeys[] = [
        "kcal",
        "protein",
        "totalFat",
        "saturatedFat",
        "unsaturatedFat",
        "carbs",
        "fiber",
      ];

      nutrientKeys.forEach((nutrientKey) => {
        actualState[nutrientKey] = calculateAndRoundNutrient(
          actualState[nutrientKey],
          customMass
        );
      });

      await createOrUpdateProductInProductBase(
        actualState,
        updateCheck,
        ctx,
        false
      );
  }
}
