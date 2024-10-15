import { Middleware, Scenes, Markup } from "telegraf";
import { DailyFood, DialogueState } from "../utils/models";

import {
  handleFromStartingScene,
  calculateDailyConsumption,
  isValidDateFormat,
  findProductInProductBase,
  IsInputStringAndNumber,
} from "../utils/utils";
import {
  getChooseProductButton,
  isCreateButton,
  createButton,
  todayOrCustomDateButton,
} from "../utils/buttons";

export const addConsumptionSteps: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  waitingForNameAndMassOfProduct,
  todayOrCustomDate,
  customDate,
  productOptions,
];

export const startingDialogueStep = addConsumptionSteps.findIndex(
  (scene) => scene === startingDialogue
);

export const waitingForNameAndMassOfProductStep = addConsumptionSteps.findIndex(
  (scene) => scene === waitingForNameAndMassOfProduct
);

export const todayOrCustomDateStep = addConsumptionSteps.findIndex(
  (scene) => scene === todayOrCustomDate
);

export const customDateStep = addConsumptionSteps.findIndex(
  (scene) => scene === customDate
);

export const productOptionsStep = addConsumptionSteps.findIndex(
  (scene) => scene === productOptions
);

export const addConsumption = new Scenes.WizardScene<Scenes.WizardContext>(
  "ADD_CONSUMPTION",
  ...addConsumptionSteps
);

export async function startingDialogue(ctx: Scenes.WizardContext) {
  (ctx.wizard.state as DailyFood).tgId = ctx.from!.id;

  const fromStartingScene2 = await handleFromStartingScene(ctx);

  if (fromStartingScene2) {
    return;
  }

  await ctx.reply(
    "TODAY - check today's consumption statistic\n" +
      "CUSTOM - check custom day of your consumption",
    Markup.inlineKeyboard(todayOrCustomDateButton)
  );
  return ctx.wizard.selectStep(todayOrCustomDateStep);
}

export async function todayOrCustomDate(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "today") {
    (ctx.wizard.state as DailyFood).dateOfConsumption = new Date();
    await ctx.reply(
      "Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
    );
    return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
  }

  await ctx.reply("Enter date that you require in this format YYYY-MM-DD");
  return ctx.wizard.selectStep(customDateStep);
}

export async function customDate(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  if (!isValidDateFormat(ctx.message.text)) {
    await ctx.reply(
      "Wrong! Enter date that you require in this format YYYY-MM-DD"
    );
    return;
  }

  (ctx.wizard.state as DailyFood).dateOfConsumption = new Date(
    ctx.message.text
  );
  await ctx.reply(
    "Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
  );
  return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
}

export async function waitingForNameAndMassOfProduct(
  ctx: Scenes.WizardContext
) {
  const actualState = ctx.wizard.state as DailyFood;
  const create = isCreateButton(ctx);

  if (create) {
    let initalState = {} as DialogueState;
    initalState.name = actualState.name;
    return ctx.scene.enter("CREATE_PRODUCT", initalState);
  }

  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const productNameAndMass = IsInputStringAndNumber(ctx.message.text);

  if (productNameAndMass === null) {
    await ctx.reply(
      "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100, red apple 100, sweet red apple 100 etc.)"
    );
    return;
  }

  actualState.name = productNameAndMass[0];
  actualState.mass = productNameAndMass[1];
  const tgId = actualState.tgId;
  const searchResults = await findProductInProductBase(
    actualState.name
    // tgId
  );

  if (searchResults === null) {
    await ctx.reply("This product does not exist in product database");
    await ctx.reply(
      `Create - to create ${actualState.name} in product database\n
        Or try again and just enter the name of product`,
      createButton
    );
    return;
  }

  if (searchResults.length === 1) {
    const foodElement = searchResults[0];
    foodElement.mass = actualState.mass;
    await calculateDailyConsumption(foodElement, actualState, ctx, tgId);
    return;
  }

  actualState.arrayOfProducts = searchResults;
  const chooseProductButton = getChooseProductButton(searchResults);
  await ctx.reply("Did you mean one of these products?", chooseProductButton);

  return ctx.wizard.selectStep(productOptionsStep);
}

export async function productOptions(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const actualState = ctx.wizard.state as DailyFood;

  const tgId = actualState.tgId;

  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  const foodElement = Object.values(actualState.arrayOfProducts).find(
    (product) => product._id!.toString() === callBackData
  );

  await calculateDailyConsumption(foodElement!, actualState, ctx, tgId);
}
