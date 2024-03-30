import { Middleware, Scenes } from "telegraf";
import { CombinedProduct, DialogueState } from "../utils/models";
import {
  existenceOfTheSameProduct,
  getYesOrNoButton,
  yesOrNoButton,
  doneButton,
  addElementToSheet,
  isDoneButton,
  getProductDetails,
  combineNutrition,
  getProductNameAndMass,
  getFixButtonCombinedProduct,
  textIsNumber,
  replaceCommaToDot,
  getProductRowIdNameMass,
  updateProductMassByName,
  calculateCombinedMass,
  replaceOrIgnoreButton,
  doesProductExistInState,
  getReplaceOrIgnoreButton,
} from "../utils/utils";

const addCombinedProductSteps: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  waitingForProductName,
  isReplaceTheProduct,
  waitingForNameAndMassOfProduct,
  createTheProduct,
  isFixingSomething,
  fixingAndFinal,
  fixingMassOfProduct,
  replaceOrIgnore,
];

const startingDialogueStep = addCombinedProductSteps.findIndex(
  (scene) => scene === startingDialogue
);

const waitingForProductNameStep = addCombinedProductSteps.findIndex(
  (scene) => scene === waitingForProductName
);

const isReplaceTheProductStep = addCombinedProductSteps.findIndex(
  (scene) => scene === isReplaceTheProduct
);

const waitingForNameAndMassOfProductStep = addCombinedProductSteps.findIndex(
  (scene) => scene === waitingForNameAndMassOfProduct
);

const createTheProductStep = addCombinedProductSteps.findIndex(
  (scene) => scene === createTheProduct
);

const isFixingSomethingStep = addCombinedProductSteps.findIndex(
  (scene) => scene === isFixingSomething
);

const fixingAndFinalStep = addCombinedProductSteps.findIndex(
  (scene) => scene === fixingAndFinal
);

const fixingMassOfProductStep = addCombinedProductSteps.findIndex(
  (scene) => scene === fixingMassOfProduct
);

const replaceOrIgnoreStep = addCombinedProductSteps.findIndex(
  (scene) => scene === replaceOrIgnore
);
//////////////////////////////////////

export const addCombinedProduct = new Scenes.WizardScene<Scenes.WizardContext>(
  "ADD_COMBINED_PRODUCT",
  ...addCombinedProductSteps
);

// start of the dialogue
async function startingDialogue(ctx: Scenes.WizardContext) {
  await ctx.reply("Name of product that you want to create");
  return ctx.wizard.selectStep(waitingForProductNameStep);
}

// waiting of the name of the combined product
async function waitingForProductName(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const combinedProductName = ctx.message.text.trim();

  if (ctx.message.text === undefined) {
    await ctx.reply("Wrong, write a product name");
    return;
  }
  if (await existenceOfTheSameProduct(combinedProductName)) {
    await ctx.reply("Product exists in database");
    await ctx.reply("Do you want to replace it?", yesOrNoButton);
    return ctx.wizard.selectStep(isReplaceTheProductStep);
  }

  const actualState = ctx.wizard.state as CombinedProduct;

  actualState.CombinedName = combinedProductName;
  actualState.CombinedMass = 0;
  actualState.products = {};

  await ctx.reply(
    "Enter the name and mass (in gram) of the first product to start combining in this format: NAME MASS"
  );
  return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
}

// waiting for "yes" or "no" answer of replace the product
async function isReplaceTheProduct(ctx: Scenes.WizardContext) {
  const succesButton = getYesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);
  if (succesButton) {
    (ctx.wizard.state as CombinedProduct).existanceCombined = true;
    await ctx.reply("Updating existing product");
    await ctx.reply(
      "Name and mass (in gram) of product that you want to combine product in this format: NAME MASS"
    );
    return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
  } else {
    await ctx.reply("You can't have two equal products in product base");
    await ctx.reply("If you want to enter new product use comman /add_product");
    return ctx.scene.leave();
  }
}

// waiting for the name and mass of the product
async function waitingForNameAndMassOfProduct(ctx: Scenes.WizardContext) {
  const actualState = ctx.wizard.state as CombinedProduct;

  const done = isDoneButton(ctx);
  if (done) {
    await ctx.answerCbQuery(undefined);
    const productInfo = getProductNameAndMass(actualState);
    await ctx.reply(productInfo.join("\n"));
    await ctx.reply("Do you want to fix something?", yesOrNoButton);
    return ctx.wizard.selectStep(isFixingSomethingStep);
  }

  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const inputProduct = ctx.message.text.trim();

  // convert string of input to array of strings
  const partsOfInput = inputProduct.split(" ");

  // check length of array
  if (partsOfInput.length < 2) {
    await ctx.reply(
      "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100, red apple 100, sweet red apple 100 etc.)"
    );
    return;
  }

  // convert string to number and replace comma by dot
  const stringMass = partsOfInput.pop();
  const correctedMass = stringMass!.replace(",", ".");
  const productMass = parseFloat(correctedMass);

  // convert array of strings to string (product name)
  const productName = partsOfInput.join(" ");

  // check format of input
  if (!productName || !productMass || isNaN(Number(productMass))) {
    await ctx.reply(
      "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100, red apple 100, sweet red apple 100 etc.)"
    );
    return;
  }

  actualState.actualProductName = productName;

  const existanceOfProductInState = doesProductExistInState(
    productName,
    actualState
  );

  if (existanceOfProductInState) {
    actualState.actualProductMass = productMass;
    await ctx.reply("You can't have two identical products in state");
    await ctx.reply(
      "Do you want to replace old product by new or ignore it?",
      replaceOrIgnoreButton
    );
    return ctx.wizard.selectStep(replaceOrIgnoreStep);
  }

  // check existance of product in product database
  const product = await getProductDetails(productName);
  if (product === null) {
    await ctx.reply("Product does not exist in product database");
    await ctx.reply(
      "Do you want to create it and add to product database?",
      yesOrNoButton
    );
    return ctx.wizard.selectStep(createTheProductStep);
  }

  const rowId = product.rowId;

  actualState.products[rowId] = product;
  actualState.products[rowId].name = productName;
  actualState.products[rowId].mass = productMass;

  actualState.CombinedMass += productMass;

  await ctx.reply(
    `Enter the name and mass (in gram) of the next product to combine in this format: NAME MASS press Done to calculate nutrition`,
    doneButton
  );
  return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
}

// waiting for "yes" or "no" answer of creating the product and add it to product database
async function createTheProduct(ctx: Scenes.WizardContext) {
  const succesButton = getYesOrNoButton(ctx);
  await ctx.answerCbQuery(undefined);
  if (succesButton) {
    let initalState = {} as DialogueState;
    initalState.name = (ctx.wizard.state as CombinedProduct).actualProductName;
    ctx.scene.enter("ADD_PRODUCT_TO_BASE", initalState);
    return;
  }

  await ctx.reply(
    "You can't create combined product because this product does not exist in product base"
  );
  await ctx.reply("If you want to enter new product use command /add_product");
  return ctx.scene.leave();
}

// replace or ingore product in state
async function replaceOrIgnore(ctx: Scenes.WizardContext) {
  const actualState = ctx.wizard.state as CombinedProduct;
  const productName = actualState.actualProductName;
  const productMass = actualState.actualProductMass;

  const replaceButton = getReplaceOrIgnoreButton(ctx);
  if (replaceButton) {
    updateProductMassByName(actualState, productName, productMass);
    calculateCombinedMass(actualState);

    await ctx.reply("Product data is updated in current state");
    await ctx.reply(
      `Enter the name and mass (in gram) of the next product to combine in this format: NAME MASS press Done to calculate nutrition`,
      doneButton
    );
    return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
  }

  await ctx.reply(
    `Enter the name and mass (in gram) of the next product to combine in this format: NAME MASS press Done to calculate nutrition`,
    doneButton
  );
  return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
}

// waiting for "yes" or "no" answer of fixing something or finish the dialogue
async function isFixingSomething(ctx: Scenes.WizardContext) {
  const actualState = ctx.wizard.state as CombinedProduct;
  const succesButton = getYesOrNoButton(ctx);

  if (succesButton) {
    const fixButtonCombinedProduct = getFixButtonCombinedProduct(actualState);
    await ctx.reply("Choose what you want ot fix", fixButtonCombinedProduct);
    return ctx.wizard.selectStep(fixingAndFinalStep);
  }
  const finalNutrition = combineNutrition(actualState);
  await addElementToSheet(finalNutrition);
  await ctx.reply(
    `Product ${actualState.CombinedName} created and added to database`
  );
  return ctx.scene.leave();
}

// fixing something and then finish the dialogue
async function fixingAndFinal(ctx: Scenes.WizardContext) {
  if (
    !ctx.callbackQuery ||
    !("data" in ctx.callbackQuery) ||
    ctx.callbackQuery == undefined
  ) {
    return;
  }

  const actualState = ctx.wizard.state as CombinedProduct;
  const rowIdFromCallBack = ctx.callbackQuery.data;
  const productName = getProductRowIdNameMass(actualState, rowIdFromCallBack);

  actualState.actualProductName = productName;

  await ctx.reply("Write a mass of product");
  return ctx.wizard.selectStep(fixingMassOfProductStep);
}

//fixing mass of product
async function fixingMassOfProduct(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const actualState = ctx.wizard.state as CombinedProduct;
  const productName = actualState.actualProductName;

  if (!textIsNumber(ctx.message.text)) {
    await ctx.reply("Wrong, write a number");
    return;
  }

  const mass = replaceCommaToDot(ctx.message.text);

  updateProductMassByName(actualState, productName, mass);

  await ctx.reply("Product succsesfully updated");
  await ctx.reply("Do you want to fix something else?", yesOrNoButton);
  return ctx.wizard.selectStep(isFixingSomethingStep);
}
