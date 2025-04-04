import { Scenes, Markup } from "telegraf";
import {
  IConsumedProduct,
  IDialogueState,
  InitialState,
} from "../utils/models";
import {
  handleFromStartingScene,
  isValidDateFormat,
  IsInputStringAndNumber,
  deleteAndUpdateBotMessage,
  deleteAndUpdateBotMessageCreate,
  findProductInBases,
  calculateConsumption,
} from "../utils/utils";
import {
  createButton,
  getChooseProductButton,
  todayOrCustomDateButton,
} from "../utils/buttons";
import {
  addConsumptionStepsList,
  steps,
} from "../steps-middlewares/addConsumptionSteps";

export const addConsumption = new Scenes.WizardScene<Scenes.WizardContext>(
  "ADD_CONSUMPTION",
  ...addConsumptionStepsList
);

export async function startingDialogue(ctx: Scenes.WizardContext) {
  if (!(ctx.scene.state as InitialState).fromStartingScene) {
    return await handleFromStartingScene(ctx);
  }

  (ctx.wizard.state as IConsumedProduct).tgId = ctx.from!.id;

  const firstMessage = await ctx.reply(
    "TODAY - add today's consumption statistic\n" +
      "CUSTOM - add custom day of your consumption",
    Markup.inlineKeyboard(todayOrCustomDateButton)
  );

  (ctx.wizard.state as IDialogueState).botMessageId = firstMessage.message_id;

  return ctx.wizard.selectStep(steps.todayOrCustomDate);
}

export async function todayOrCustomDate(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  await ctx.answerCbQuery();
  const callBackData = ctx.callbackQuery.data;

  if (callBackData === "today") {
    (ctx.wizard.state as IConsumedProduct).dateOfConsumption =
      new Date().toISOString();
    await ctx.editMessageText(
      "Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
    );
    return ctx.wizard.selectStep(steps.waitingForNameAndMassOfProduct);
  }

  await ctx.editMessageText(
    "Enter date that you require in this format YYYY-MM-DD"
  );
  return ctx.wizard.selectStep(steps.customDate);
}

export async function customDate(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  /* HERE IS A BUG */

  if (!isValidDateFormat(ctx.message.text)) {
    const firstMessage =
      "Wrong! Enter date that you require in this format YYYY-MM-DD";

    const secondMessage = "NO";

    // Check if 'fromValidation' flag exists
    const state = ctx.wizard.state as IDialogueState;

    if (!state.fromValidation) {
      state.fromValidation = true; // Set the flag
      await ctx.editMessageText(firstMessage); // Send the first message
      return;
    }

    await ctx.editMessageText(secondMessage); // Send the second message
    state.fromValidation = false; // Reset the flag
    return;
  }

  (ctx.wizard.state as IConsumedProduct).dateOfConsumption = new Date(
    ctx.message.text
  ).toISOString();

  await ctx.reply(
    "Enter product's name and mass (in gram) in this format: NAME MASS (example: apple 100/red apple 0.9/sweet red apple 100/etc.)"
  );
  return ctx.wizard.selectStep(steps.waitingForNameAndMassOfProduct);
}

export async function waitingForNameAndMassOfProduct(
  ctx: Scenes.WizardContext
) {
  const actualState = ctx.wizard.state as IConsumedProduct;
  const dialogueState = ctx.wizard.state as IDialogueState;

  if (
    ctx.callbackQuery &&
    "data" in ctx.callbackQuery &&
    ctx.callbackQuery.data === "create"
  ) {
    await ctx.answerCbQuery();
    let initalState = {} as IDialogueState;
    initalState.name = actualState.name;
    return ctx.scene.enter("CREATE_PRODUCT", initalState);
  }

  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const productNameAndMass = IsInputStringAndNumber(ctx.message.text);

  if (productNameAndMass === null) {
    await deleteAndUpdateBotMessage(
      ctx,
      "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100)"
    );
    return;
  }

  actualState.name = productNameAndMass[0];
  actualState.mass = productNameAndMass[1];
  const tgId = actualState.tgId;
  const searchResults = await findProductInBases(actualState.name, tgId);

  if (searchResults === null) {
    await deleteAndUpdateBotMessageCreate(ctx, createButton);
    return;
  }

  if (searchResults.length === 1) {
    const foodElement = searchResults[0];
    foodElement.mass = actualState.mass;
    await calculateConsumption(foodElement, ctx);
    return;
  }

  dialogueState.arrayOfProducts = searchResults;
  const chooseProductButton = getChooseProductButton(searchResults);
  await deleteAndUpdateBotMessage(
    ctx,
    "Did you mean one of these products?",
    chooseProductButton
  );

  return ctx.wizard.selectStep(steps.productOptions);
}

export async function productOptions(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  await ctx.answerCbQuery();

  const dialogueState = ctx.wizard.state as IDialogueState;
  const callBackData = ctx.callbackQuery.data;

  const foodElement = Object.values(dialogueState.arrayOfProducts).find(
    (product) => product._id!.toString() === callBackData
  );

  await calculateConsumption(foodElement!, ctx);
}
