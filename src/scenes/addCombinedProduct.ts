import { Scenes } from "telegraf";
import { CombinedProduct, DialogueState } from "../utils/models";
import {
  existenceOfTheSameProduct,
  getYesOrNoButton,
  yesOrNoButton,
  doneButton,
  addElementToSheet,
  isDoneButton,
  getProductDetails,
  checkFormatOfProduct,
  combineNutrition,
} from "../utils/utils";
import {
  waitingForProductNameStep,
  isReplaceTheProductStep,
  waitingForNameAndMassOfProductStep,
  isAddTheProductStep,
} from "../stepsForScenes/addCombinedProductSteps";

///////add combined product (from exiting products in product_database) data to product_database
export const addCombinedProduct = new Scenes.WizardScene<Scenes.WizardContext>(
  "ADD_COMBINED_PRODUCT",

  // STEP 0: Start of the dialogue
  async (ctx) => {
    await ctx.reply("Name of product that you want to create");
    return ctx.wizard.selectStep(waitingForProductNameStep);
  },

  // STEP 1: Waiting of the name of the product
  async (ctx) => {
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
  },

  // STEP 2: Waiting for "yes" or "no" answer of replace the product
  async (ctx) => {
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
      await ctx.reply(
        "If you want to enter new product use comman /add_product"
      );
      return ctx.scene.leave();
    }
  },

  // STEP 3: Waiting for the name and mass of the product
  async (ctx) => {
    const actualState = ctx.wizard.state as CombinedProduct;

    const done = isDoneButton(ctx);
    if (done) {
      await ctx.answerCbQuery(undefined);
      const combinedProductName = actualState.CombinedName;
      console.log(actualState);
      const finalNutrition = combineNutrition(actualState);
      await addElementToSheet(finalNutrition);
      await ctx.reply(
        `Product ${combinedProductName} created and added to database`
      );
      return ctx.scene.leave();
    }

    if (!ctx.message || !("text" in ctx.message)) {
      return;
    }

    const inputProduct = ctx.message.text.trim();

    const formatOfProduct = checkFormatOfProduct(inputProduct);
    if (!formatOfProduct) {
      await ctx.reply(
        "Wrong, write a product name and mass (in gram) in this format: NAME MASS (example: apple 100, red apple 100, sweet red apple 100 etc.)"
      );
      return;
    }

    const parts = inputProduct.split(" ");
    const mass = parts.pop() as string;
    const productMass = parseInt(mass);
    const productName = parts.join(" ");

    const product = await getProductDetails(productName);
    if (product === null) {
      await ctx.reply("Product does not exist in database");
      await ctx.reply("Do you want to add it?", yesOrNoButton);
      return ctx.wizard.selectStep(isAddTheProductStep);
    }

    actualState.products[productName] = product;
    actualState.products[productName].mass = productMass;
    actualState.actualProductName = productName;
    actualState.CombinedMass += productMass;

    await ctx.reply(
      `Enter the name and mass (in gram) of the next product to combine in this format: NAME MASS press Done to calculate nutrition`,
      doneButton
    );
    return ctx.wizard.selectStep(waitingForNameAndMassOfProductStep);
  },

  // STEP 4: Waiting for "yes" or "no" answer of adding the product
  async (ctx) => {
    const succesButton = getYesOrNoButton(ctx);
    await ctx.answerCbQuery(undefined);
    if (succesButton) {
      let initalState = {} as DialogueState;
      initalState.name = (
        ctx.wizard.state as CombinedProduct
      ).actualProductName;
      ctx.scene.enter("ADD_PRODUCT_TO_BASE", initalState);
      return;
    }

    await ctx.reply(
      "You can't create combined product because this product does not exist in product base"
    );
    await ctx.reply(
      "If you want to enter new product use command /add_product"
    );
    return ctx.scene.leave();
  }

  ////////////// TO DO: STEP OF FIXING SOMETHING

  // const productMass = (ctx.wizard.state as CombinedProduct).mass;
  // const productName = (ctx.wizard.state as CombinedProduct).actualProductName;

  ///////////////
);
