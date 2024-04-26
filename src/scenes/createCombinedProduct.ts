import { Middleware, Scenes } from "telegraf";
import { CombinedProduct, DialogueState } from "../utils/models";
import {
  getYesOrNoButton,
  yesOrNoButton,
  doneButton,
  isDoneButton,
  getProductNameAndMass,
  getFixButtonCombinedProduct,
  isValidNumberString,
  replaceCommaToDot,
  getProductNameById,
  replaceProductMassInState,
  recalculateCombinedMass,
  replaceAddOrIgnoreButton,
  doesProductExistInState,
  handleFromStartingScene,
  doesExistTheSameProductWithTgId,
  createOrDoneButton,
  createOrUpdateProductInProductBase,
  combineAllNutrition,
  addProductMassInState,
  updateProductMassAndName,
  getProductNutritionFromBaseIfExists,
  isCreateButton,
  IsInputStringAndNumber,
} from "../utils/utils";

const createCombinedProductSteps: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  waitingForCombinedProductName,
  isReplaceTheProduct,
  waitingForNameAndMassOfProduct,
  isFixingSomethingOrFinish,
  fixingAndFinal,
  fixingMassOfProduct,
  replaceAddOrIgnore,
];

const startingDialogueStep = createCombinedProductSteps.findIndex(
  (scene) => scene === startingDialogue
);

const waitingForCombinedProductNameStep = createCombinedProductSteps.findIndex(
  (scene) => scene === waitingForCombinedProductName
);

const isReplaceTheProductStep = createCombinedProductSteps.findIndex(
  (scene) => scene === isReplaceTheProduct
);

const waitingForNameAndMassOfProductStep = createCombinedProductSteps.findIndex(
  (scene) => scene === waitingForNameAndMassOfProduct
);

const isFixingSomethingOrFinishStep = createCombinedProductSteps.findIndex(
  (scene) => scene === isFixingSomethingOrFinish
);

const fixingAndFinalStep = createCombinedProductSteps.findIndex(
  (scene) => scene === fixingAndFinal
);

const fixingMassOfProductStep = createCombinedProductSteps.findIndex(
  (scene) => scene === fixingMassOfProduct
);

const replaceAddOrIgnoreStep = createCombinedProductSteps.findIndex(
  (scene) => scene === replaceAddOrIgnore
);
//////////////////////////////////////

export const createCombinedProduct =
  new Scenes.WizardScene<Scenes.WizardContext>(
    "CREATE_COMBINED_PRODUCT",
    ...createCombinedProductSteps
  );

// start of the dialogue
async function startingDialogue(ctx: Scenes.WizardContext) {
  (ctx.wizard.state as CombinedProduct).tgId = ctx.from!.id;
  const fromStartingScene2 = await handleFromStartingScene(ctx);

  if (fromStartingScene2) {
    return;
  }

  await ctx.reply("Name of product that you want to create");
  return ctx.wizard.selectStep(waitingForCombinedProductNameStep);
}

// waiting of the name of the combined product
async function waitingForCombinedProductName(ctx: Scenes.WizardContext) {
  if (!ctx.message || !("text" in ctx.message)) {
    return;
  }

  const actualState = ctx.wizard.state as CombinedProduct;

  const tgId = actualState.tgId;

  const combinedProductName = ctx.message.text.trim();

  if (ctx.message.text === undefined) {
    await ctx.reply("Wrong, write a product name");
    return;
  }

  const existance = await doesExistTheSameProductWithTgId(
    combinedProductName,
    tgId
  );

  if (existance) {
    actualState.CombinedName = combinedProductName;
    actualState.CombinedMass = 0;
    actualState.products = {};

    await ctx.reply("Product already exists in database");
    await ctx.reply("Do you want to replace it?", yesOrNoButton);
    return ctx.wizard.selectStep(isReplaceTheProductStep);
  }

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
    (ctx.wizard.state as CombinedProduct).updateProduct = true;
    await ctx.reply("Updating existing combined product");
    await ctx.reply(
      "Name and mass (in gram) of product that you want to combine product in this format: NAME MASS"
    );
    return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
  }
  await ctx.reply("You can't have two equal products in product base");
  await ctx.reply(
    "If you want to enter new product use command /start_calculation"
  );
  return ctx.scene.enter("START_CALCULATION");
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
    return ctx.wizard.selectStep(isFixingSomethingOrFinishStep);
  }

  const create = isCreateButton(ctx);
  if (create) {
    let initalState = {} as DialogueState;
    initalState.name = (ctx.wizard.state as CombinedProduct).actualProductName;
    return ctx.scene.enter("CREATE_PRODUCT", initalState);
  }

  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply(
      "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100, red apple 100, sweet red apple 100 etc.)"
    );
    return;
  }

  const inputProduct = ctx.message.text;

  const productNameAndMass = IsInputStringAndNumber(inputProduct);
  if (productNameAndMass === null) {
    await ctx.reply(
      "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100, red apple 100, sweet red apple 100 etc.)"
    );
    return;
  }
  const productName = productNameAndMass[0];
  const productMass = productNameAndMass[1];

  actualState.actualProductName = productName;
  const tgId = actualState.tgId;
  actualState.checkForCombined = true;

  const existanceOfProductInState = doesProductExistInState(
    productName,
    actualState
  );

  if (existanceOfProductInState) {
    actualState.actualProductMass = productMass;
    await ctx.reply(
      "You can't have two identical products as a part of combined product"
    );

    await ctx.reply(
      "Press REPLACE if you want to replace product data, ADD if you want to add this data to previous and IGNORE if you don't want to change previous data",
      replaceAddOrIgnoreButton
    );
    return ctx.wizard.selectStep(replaceAddOrIgnoreStep);
  }

  const product = await getProductNutritionFromBaseIfExists(productName, tgId);

  if (product === null) {
    await ctx.reply("This product does not exist in product database");
    await ctx.reply(
      `
    Create - to create ${productName} in product database;
    Done - to calculate nutrition of ${actualState.CombinedName};
    Or just enter the name and mass (in gram) of the next product to combine in this format: NAME MASS, to ignore ${productName}`,
      createOrDoneButton
    );
    return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
  }

  const documentId = product.documentId!;

  actualState.products[documentId] = product;
  actualState.products[documentId].name = productName;
  actualState.products[documentId].mass = productMass;

  actualState.CombinedMass += productMass;

  await ctx.reply(
    `Enter the name and mass (in gram) of the next product to combine in this format: NAME MASS press Done to calculate nutrition`,
    doneButton
  );
  return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
}

// replace, add or ingore product in state
async function replaceAddOrIgnore(ctx: Scenes.WizardContext) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const actualState = ctx.wizard.state as CombinedProduct;
  const productName = actualState.actualProductName;
  const productMass = actualState.actualProductMass;
  const callBackData = ctx.callbackQuery.data;

  await ctx.answerCbQuery();

  switch (callBackData) {
    case "replace":
      replaceProductMassInState(actualState, productName, productMass);
      recalculateCombinedMass(actualState);
      await ctx.reply("Product succsesfully replaced");
      await ctx.reply(
        `Enter the name and mass (in gram) of the next product to combine in this format: NAME MASS press Done to calculate nutrition`,
        doneButton
      );
      return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
    case "add":
      addProductMassInState(actualState, productName, productMass);
      recalculateCombinedMass(actualState);
      await ctx.reply("Product mass succsesfully added");
      await ctx.reply(
        `Enter the name and mass (in gram) of the next product to combine in this format: NAME MASS press Done to calculate nutrition`,
        doneButton
      );
      return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
    case "ignore":
      Object.keys(actualState.products).forEach((documentId) => {
        const product = actualState.products[documentId];
        if (product.name === productName) {
          product.mass = product.mass;
        }
      });
      await ctx.reply("New mass of product succsesfully ignored");
      await ctx.reply(
        `Enter the name and mass (in gram) of the next product to combine in this format: NAME MASS press Done to calculate nutrition`,
        doneButton
      );
      return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
  }
}

////// waiting for "yes" or "no" answer of fixing something or finish the dialogue
async function isFixingSomethingOrFinish(ctx: Scenes.WizardContext) {
  const actualState = ctx.wizard.state as CombinedProduct;
  const succesButton = getYesOrNoButton(ctx);

  await ctx.answerCbQuery();

  if (succesButton) {
    const fixButtonCombinedProduct = getFixButtonCombinedProduct(actualState);
    await ctx.reply("Choose what you want ot fix", fixButtonCombinedProduct);
    return ctx.wizard.selectStep(fixingAndFinalStep);
  }

  const finalNutrition = combineAllNutrition(actualState);

  const updateCheck = (ctx.scene.state as DialogueState).updateProduct;

  await createOrUpdateProductInProductBase(finalNutrition, updateCheck, ctx);
}

// fixing something and then finish the dialogue
async function fixingAndFinal(ctx: Scenes.WizardContext) {
  if (
    !ctx.callbackQuery ||
    !("data" in ctx.callbackQuery) ||
    ctx.callbackQuery === undefined
  ) {
    return;
  }

  await ctx.answerCbQuery();

  const actualState = ctx.wizard.state as CombinedProduct;
  const documentIdFromCallBack = ctx.callbackQuery.data;
  const productName = getProductNameById(actualState, documentIdFromCallBack);

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

  if (!isValidNumberString(ctx.message.text)) {
    await ctx.reply("Wrong, write a number in this format: 10/10.0/10,0");
    return;
  }

  const mass = replaceCommaToDot(ctx.message.text);

  updateProductMassAndName(actualState, productName, mass);

  await ctx.reply("Product state succsesfully updated");
  await ctx.reply("Do you want to fix something else?", yesOrNoButton);
  return ctx.wizard.selectStep(isFixingSomethingOrFinishStep);
}
