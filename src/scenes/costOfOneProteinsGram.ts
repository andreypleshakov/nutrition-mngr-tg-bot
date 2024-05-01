import { Middleware, Scenes } from "telegraf";

import {
  isValidNumberString,
  replaceCommaToDot,
  IsInputStringAndNumber,
  calculationOfCostProtein,
} from "../utils/utils";
import { CostOfProtein } from "../utils/models";
import { perButton } from "../utils/buttons";

export const costOfOneProteinsGramSteps: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  nameOfProduct,
  perHundredOrCustomMass,
  customMass,
  proteinPerSelectedMass,
  totalMassOfProduct,
  costOfProduct,
  finalCalculation,
];

export const startingDialogueStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === startingDialogue
);

export const nameOfProductStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === nameOfProduct
);

export const perHundredOrCustomMassStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === perHundredOrCustomMass
);

export const customMassStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === customMass
);

export const proteinPerSelectedMassStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === proteinPerSelectedMass
);

export const totalMassOfProductStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === totalMassOfProduct
);

export const costOfProductStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === costOfProduct
);

export const fixingOrFinalStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === fixingOrFinal
);

export const finalCalculationStep = costOfOneProteinsGramSteps.findIndex(
  (scene) => scene === finalCalculation
);

export const costOfOneProteinsGram =
  new Scenes.WizardScene<Scenes.WizardContext>(
    "COST_OF_PROTEIN",
    ...costOfOneProteinsGramSteps
  );

//start dialogue
export async function startingDialogue(ctx: Scenes.WizardContext) {
  await ctx.reply("Name of product");
  return ctx.wizard.selectStep(nameOfProductStep);
}

export async function nameOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Wrong, write a product name");
    return;
  }
  (ctx.wizard.state as CostOfProtein).nameOfProduct = ctx.message.text.trim();
  await ctx.reply(
    "Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM",
    perButton
  );
  return ctx.wizard.selectStep(perHundredOrCustomMassStep);
}

//choose scope of mass of nutrition
export async function perHundredOrCustomMass(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }
  const callBackData = ctx.callbackQuery.data;
  await ctx.answerCbQuery();

  if (callBackData === "100-gram") {
    (ctx.wizard.state as CostOfProtein).massScope = 100;
    await ctx.reply("Protein per 100 gram");
    return ctx.wizard.selectStep(proteinPerSelectedMassStep);
  } else if (callBackData === "custom-mass") {
    await ctx.reply("Enter mass that you want to calculate");
    return ctx.wizard.selectStep(customMassStep);
  }
}

//if custom mass
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

  (ctx.wizard.state as CostOfProtein).massScope = customMass;

  await ctx.reply(`Protein per ${customMass} gram`);
  return ctx.wizard.selectStep(proteinPerSelectedMassStep);
}

//enter protein per selected mass
export async function proteinPerSelectedMass(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  (ctx.wizard.state as CostOfProtein).protein = replaceCommaToDot(
    ctx.message.text
  );

  await ctx.reply("Enter total mass of product");
  return ctx.wizard.selectStep(totalMassOfProductStep);
}

//enter total mass of product
export async function totalMassOfProduct(ctx: Scenes.WizardContext) {
  if (
    !ctx.message ||
    !("text" in ctx.message) ||
    !isValidNumberString(ctx.message.text)
  ) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }
  (ctx.wizard.state as CostOfProtein).totalMass = replaceCommaToDot(
    ctx.message.text
  );
  await ctx.reply(
    "Enter currency with cost of product (ex.: usd 100, usd 10.1, usd 10,1"
  );
  return ctx.wizard.selectStep(costOfProductStep);
}

//enter cost of product
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

  (ctx.wizard.state as CostOfProtein).nameOfCurrency = currencyAmountAndName[0]; // usd
  (ctx.wizard.state as CostOfProtein).cost = currencyAmountAndName[1]; // 100

  const fixButtonCostOfProtein = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Name", callback_data: "name" }],
        [{ text: "Scope of protein", callback_data: "scope" }],
        [
          {
            text: `Protein per ${
              (ctx.wizard.state as CostOfProtein).massScope
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
  return ctx.wizard.selectStep(fixingOrFinalStep);
}

//edit something?
export async function fixingOrFinal(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }
  const callBackData = ctx.callbackQuery.data;

  await ctx.answerCbQuery();

  switch (callBackData) {
    case "name":
      await ctx.reply("Name of product");
      return ctx.wizard.selectStep(nameOfProductStep);
    case "scope":
      await ctx.reply(
        "Choose the scope of mass you want to calculate nutrition PER 100 or PER CUSTOM",
        perButton
      );
      return ctx.wizard.selectStep(perHundredOrCustomMassStep);
    case "protein-per-scope":
      await ctx.reply(`Protein per ${customMass} gram`);
      return ctx.wizard.selectStep(proteinPerSelectedMassStep);
    case "cost":
      await ctx.reply(
        "Enter currency with cost of product (ex.: usd 100, usd 10.1, usd 10,1"
      );
      return ctx.wizard.selectStep(costOfProductStep);
    case "finish":
      return ctx.wizard.selectStep(finalCalculationStep);
  }
}

export async function finalCalculation(ctx: Scenes.WizardContext) {
  const actualState = ctx.wizard.state as CostOfProtein;

  //TO DO
  calculationOfCostProtein(actualState);
  //
}
