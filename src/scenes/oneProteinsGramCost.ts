import { Scenes } from "telegraf";
import {
  isValidNumberString,
  replaceCommaToDot,
  IsInputStringAndNumber,
  handleFromStartingScene,
} from "../utils/utils";
import { ICostOfProtein, InitialState } from "../utils/models";
import { perButton } from "../utils/buttons";
import {
  oneProteinsGramCostStepsList,
  steps,
} from "../steps-middlewares/oneProteinsGramCostSteps";

export const costOfOneProteinsGram =
  new Scenes.WizardScene<Scenes.WizardContext>(
    "COST_OF_PROTEIN",
    ...oneProteinsGramCostStepsList
  );

export async function startingDialogue(ctx: Scenes.WizardContext) {
  if (!(ctx.scene.state as InitialState).fromStartingScene) {
    return await handleFromStartingScene(ctx);
  }

  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(steps.nameOfProduct);
}

export async function nameOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Wrong, write a product name");
    return;
  }
  (ctx.wizard.state as ICostOfProtein).nameOfProduct = ctx.message.text.trim();
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
    (ctx.wizard.state as ICostOfProtein).massScope = 100;
    await ctx.reply("Protein per 100 gram");
    return ctx.wizard.selectStep(steps.proteinPerSelectedMass);
  } else if (callBackData === "custom-mass") {
    await ctx.reply("Enter mass that you want to calculate");
    return ctx.wizard.selectStep(steps.customMass);
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

  (ctx.wizard.state as ICostOfProtein).massScope = customMass;

  await ctx.reply(`Protein per ${customMass} gram`);
  return ctx.wizard.selectStep(steps.proteinPerSelectedMass);
}

export async function proteinPerSelectedMass(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as ICostOfProtein).protein = replaceCommaToDot(
    ctx.message.text
  );

  await ctx.reply("Enter total mass of product");
  return ctx.wizard.selectStep(steps.totalMassOfProduct);
}

export async function totalMassOfProduct(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }
  (ctx.wizard.state as ICostOfProtein).totalMass = replaceCommaToDot(
    ctx.message.text
  );
  await ctx.reply(
    "Enter currency with cost of product (ex.: usd 100, usd 10.1, usd 10,1"
  );
  return ctx.wizard.selectStep(steps.costOfProduct);
}

export async function costOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply(
      "Wrong! Enter currency with cost of product in this format: usd 100, usd 10.1, usd 10,1"
    );
    return;
  }

  const input = ctx.message.text;

  const currencyAmountAndName = IsInputStringAndNumber(input);

  if (currencyAmountAndName === null) {
    await ctx.reply(
      "Wrong! Enter currency with cost of product in this format: usd 100, usd 10.1, usd 10,1"
    );
    return;
  }

  (ctx.wizard.state as ICostOfProtein).nameOfCurrency =
    currencyAmountAndName[0]; // usd
  (ctx.wizard.state as ICostOfProtein).cost = currencyAmountAndName[1]; // 100

  const fixButtonCostOfProtein = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Name", callback_data: "name" }],
        [{ text: "Scope of protein", callback_data: "scope" }],
        [
          {
            text: `Protein per ${
              (ctx.wizard.state as ICostOfProtein).massScope
            } `,
            callback_data: "protein-per-scope",
          },
        ],
        [{ text: "Product cost", callback_data: "cost" }],
        [{ text: "Finish", callback_data: "finish" }],
      ],
    },
  };

  await ctx.replyWithAnimation(
    "Choose what you want to fix or press Finish to calculate?",
    fixButtonCostOfProtein
  );
  return ctx.wizard.selectStep(steps.fixingOrFinal);
}

export async function fixingOrFinal(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }
  const callBackData = ctx.callbackQuery.data;

  await ctx.answerCbQuery();

  switch (callBackData) {
    case "name":
      await ctx.reply("Name of product");
      return ctx.wizard.selectStep(steps.nameOfProduct);
    case "scope":
      await ctx.reply(
        "Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM",
        perButton
      );
      return ctx.wizard.selectStep(steps.perHundredOrCustomMass);
    case "protein-per-scope":
      await ctx.reply(`Protein per ${customMass} gram`);
      return ctx.wizard.selectStep(steps.proteinPerSelectedMass);
    case "cost":
      await ctx.reply(
        "Enter currency with cost of product (ex.: usd 100, usd 10.1, usd 10,1"
      );
      return ctx.wizard.selectStep(steps.costOfProduct);
    case "finish":
      return ctx.wizard.selectStep(steps.finalCalculation);
  }
}

export async function finalCalculation(ctx: Scenes.WizardContext) {
  const actualState = ctx.wizard.state as ICostOfProtein;
}
