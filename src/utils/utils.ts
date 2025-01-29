import {
  FoodElement,
  CombinedProduct,
  DailyFood,
  DialogueState,
  CostOfProtein,
} from "./models";
import { userBase, dailyFoodBase, productBase } from "./schemas";
import { Scenes } from "telegraf";
import { ButtonType, createButton, getfixButtonProductBase } from "./buttons";

/*
export function calculationOfCostProtein(actualState: CostOfProtein): number {
  const amountOfProtein = actualState.protein / actualState.massScope;
  const costOfGram = actualState.cost / actualState.totalMass;
  const costForOneGramOfProtein = costOfGram / amountOfProtein;
  return costForOneGramOfProtein;
}
  */

export function calculateAndRoundNutrient(
  nutrient: number,
  customMass: number
): number {
  const nutrientPerGram = roundToThree(nutrient / customMass);
  return nutrientPerGram;
}

export function replaceProductMassInState(
  combinedProduct: CombinedProduct,
  productName: string,
  mass: number
) {
  Object.keys(combinedProduct.products).forEach((documentId) => {
    const product = combinedProduct.products[documentId];
    if (product.name === productName) {
      product.mass = mass;
    }
  });
}

export function addProductMassInState(
  combinedProduct: CombinedProduct,
  productName: string,
  mass: number
) {
  Object.keys(combinedProduct.products).forEach((documentId) => {
    const product = combinedProduct.products[documentId];
    if (product.name === productName) {
      product.mass = product.mass + mass;
    }
  });
}

export function updateProductMassAndName(
  combinedProduct: CombinedProduct,
  productName: string,
  mass: number
) {
  Object.keys(combinedProduct.products).forEach((documentId) => {
    const product = combinedProduct.products[documentId];
    if (product.name === productName) {
      product.mass = mass;
      product.name = productName;
    }
  });
}

export function recalculateCombinedMass(combinedProduct: CombinedProduct) {
  const newMass = Object.values(combinedProduct.products).reduce(
    (accumulator, product) => accumulator + product.mass,
    0
  );
  combinedProduct.CombinedMass = newMass;
  return combinedProduct.CombinedMass;
}

export function IsInputStringAndNumber(
  inputProduct: string
): [string, number] | null {
  const partsOfInput = inputProduct.trim().split(" ");

  if (partsOfInput.length < 2) {
    return null;
  }

  const stringMass = partsOfInput.pop();
  const correctedMass = stringMass!.replace(",", ".");
  const productMass = parseFloat(correctedMass);
  const productName = partsOfInput.join(" ");

  if (!productName || !productMass || isNaN(Number(productMass))) {
    return null;
  }

  return [productName, productMass];
}

export function doesProductExistInState(
  productName: string,
  combinedProduct: CombinedProduct
): boolean {
  const existingProductName = Object.values(combinedProduct.products).find(
    (product) => product.name === productName
  );

  if (existingProductName) {
    return true;
  }
  return false;
}

export function getProductNameAndMass(
  combinedProduct: CombinedProduct
): string[] {
  let productInfoArray: string[] = [];

  Object.keys(combinedProduct.products).forEach((documentId) => {
    const product = combinedProduct.products[documentId];
    const productInfo = `${product.name}: ${product.mass}`;
    productInfoArray.push(productInfo);
  });
  return productInfoArray;
}

export function roundToThree(num: number): number {
  return +num.toFixed(3);
}

export function calculatePercentageOfNutrient(
  nutrientMass: number,
  foodElement: FoodElement
): number {
  const sumNutrition = roundToThree(
    foodElement.protein + foodElement.totalFat + foodElement.carbs
  );

  if (sumNutrition === 0) {
    return 0;
  }

  const persetnageOfNutrient = Math.round((nutrientMass / sumNutrition) * 100);
  return persetnageOfNutrient;
}

export function calculateFatTypePercentage(
  fatType: number,
  totalFat: number
): number {
  if (totalFat === 0) {
    return 0;
  }
  const percentageOfFatType = Math.round((fatType / totalFat) * 100);
  return percentageOfFatType;
}

export function isValidDateFormat(date: string): boolean {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);

  if (month < 1 || month > 12) {
    return false;
  }

  const dateObj = new Date(year, month - 1, day);

  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() + 1 !== month ||
    dateObj.getDate() !== day
  ) {
    return false;
  }

  return true;
}

export function isValidNumberString(text: string): boolean {
  if (!/^[0-9,.]*$/.test(text)) {
    return false;
  }

  const commaCount = (text.match(/,/g) || []).length;
  const periodCount = (text.match(/\./g) || []).length;

  if (
    commaCount > 1 ||
    periodCount > 1 ||
    (commaCount === 1 && periodCount === 1)
  ) {
    return false;
  }

  return true;
}

export function combineAllNutrition(
  combinedProduct: CombinedProduct
): FoodElement {
  let resultProduct: FoodElement = {
    name: combinedProduct.CombinedName,
    mass: combinedProduct.CombinedMass,

    kcal: 0,
    protein: 0,
    totalFat: 0,
    saturatedFat: 0,
    unsaturatedFat: 0,
    carbs: 0,
    fiber: 0,

    tgId: combinedProduct.tgId,
  };

  Object.keys(combinedProduct.products).forEach((productName) => {
    const product = combinedProduct.products[productName];

    resultProduct.kcal += product.kcal * product.mass;
    resultProduct.protein += product.protein * product.mass;
    resultProduct.totalFat += product.totalFat * product.mass;
    resultProduct.saturatedFat += product.saturatedFat * product.mass;
    resultProduct.unsaturatedFat += product.unsaturatedFat * product.mass;
    resultProduct.carbs += product.carbs * product.mass;
    resultProduct.fiber += product.fiber * product.mass;
  });

  const perGramResultProduct = resultProduct;
  perGramResultProduct.kcal =
    perGramResultProduct.kcal / perGramResultProduct.mass;
  perGramResultProduct.protein =
    perGramResultProduct.protein / perGramResultProduct.mass;
  perGramResultProduct.totalFat =
    perGramResultProduct.totalFat / perGramResultProduct.mass;
  perGramResultProduct.saturatedFat =
    perGramResultProduct.saturatedFat / perGramResultProduct.mass;
  perGramResultProduct.unsaturatedFat =
    perGramResultProduct.unsaturatedFat / perGramResultProduct.mass;
  perGramResultProduct.carbs =
    perGramResultProduct.carbs / perGramResultProduct.mass;
  perGramResultProduct.fiber =
    perGramResultProduct.fiber / perGramResultProduct.mass;

  return perGramResultProduct;
}

export function newCheckFormatOfProduct(
  productName: string,
  productMass: number
): boolean {
  if (!productName || !productMass || isNaN(Number(productMass))) {
    return false;
  }
  return true;
}

export function checkFormatOfProduct(userInput: string): boolean {
  const parts = userInput.trim().split(" ");
  const mass = parts.pop();
  const productName = parts.join(" ");
  if (!productName || !mass || isNaN(Number(mass))) {
    return false;
  }

  return true;
}

export function replaceCommaToDot(input: string): number {
  const finalInput = input.trim();
  return parseFloat(finalInput.replace(",", "."));
}

export function getProductNameById(
  combinedProduct: CombinedProduct,
  callBackData: string
): string {
  const product = Object.values(combinedProduct.products).find(
    (product) => product._id!.toString() === callBackData
  );

  return product!.name!;
}

export function formatDate(date: Date): string | null {
  if (date !== undefined) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
  return null;
}

export async function doesExistTheSameProductWithTgId(
  productName: string
  // tgId: number
): Promise<boolean> {
  const existance = await productBase.findOne({
    name: productName,
    // tgId: tgId,
  });

  if (existance) {
    return true;
  }
  return false;
}

export async function getProductNutritionFromBaseIfExists(
  productName: string,
  tgId: number
): Promise<FoodElement | null> {
  const product = await productBase.findOne({
    name: productName,
    tgId: tgId,
  });

  if (!product) {
    return null;
  }
  const newStringProductId = product!._id.toString();

  const nutrition = {} as FoodElement;
  (nutrition._id = newStringProductId),
    (nutrition.name = productName),
    (nutrition.kcal = product!.kcal),
    (nutrition.protein = product!.protein),
    (nutrition.totalFat = product!.totalFat),
    (nutrition.saturatedFat = product!.saturatedFat),
    (nutrition.unsaturatedFat = product!.unsaturatedFat),
    (nutrition.carbs = product!.carbs);

  nutrition.tgId = tgId;

  return nutrition;
}

export async function handleFromFixingStep(
  ctx: Scenes.WizardContext
): Promise<boolean> {
  const dialogueState = ctx.wizard.state as DialogueState;
  const actualState = ctx.wizard.state as FoodElement;
  const fixButtonProductBase = getfixButtonProductBase(actualState);

  if (dialogueState.fromFixingStep) {
    await ctx.reply(
      "Choose what you want ot fix or press done to create product",
      fixButtonProductBase
    );
    return true;
  }
  return false;
}

export async function handleFromStartingScene(
  ctx: Scenes.WizardContext
): Promise<boolean> {
  const dialogueState = ctx.wizard.state as DialogueState;

  if (dialogueState.fromStartingScene !== true) {
    await ctx.reply("You can't calculate anything because you are not logged");
    await ctx.reply("Start using this bot by this command /start_calculation");
    ctx.scene.leave();
    return true;
  }
  return false;
}

export async function createProductInBase(
  foodElement: FoodElement
): Promise<void> {
  const { name, tgId } = foodElement;

  const kcal = roundToThree(foodElement.kcal);
  const protein = roundToThree(foodElement.protein);
  const saturatedFat = roundToThree(foodElement.saturatedFat);
  const unsaturatedFat = roundToThree(foodElement.unsaturatedFat);
  const carbs = roundToThree(foodElement.carbs);
  const totalFat = roundToThree(foodElement.totalFat);
  const sumNutrition = roundToThree(protein + totalFat + carbs);

  let proteinPercent = 0,
    totalFatPercent = 0,
    carbPercent = 0,
    satFatPercent = 0,
    unsatFatPercent = 0;

  if (sumNutrition > 0) {
    proteinPercent = Math.round((protein / sumNutrition) * 100);
    carbPercent = Math.round((carbs / sumNutrition) * 100);
    totalFatPercent =
      totalFat > 0 ? Math.round((totalFat / sumNutrition) * 100) : 0;
  }

  if (totalFat > 0) {
    satFatPercent = Math.round((saturatedFat / totalFat) * 100);
    unsatFatPercent = Math.round((unsaturatedFat / totalFat) * 100);
  }

  const newProduct = new productBase({
    name,
    kcal,
    protein,
    saturatedFat: saturatedFat,
    unsaturatedFat: unsaturatedFat,
    totalFat,
    carbs,
    proteinPercent,
    totalFatPercent,
    carbPercent,
    satFatPercent,
    unsatFatPercent,
    tgId,
  });

  await newProduct.save();
}
export async function findProductInProductBase(
  productName: string
  // tgId: number
): Promise<FoodElement[] | null> {
  const searchResults = await productBase.aggregate<FoodElement>([
    {
      $search: {
        index: "searchProducts",
        text: {
          query: productName,
          path: "name",
        },
      },
    },
    // {
    //   $match: {
    //     tgId: tgId,
    //   },
    // },
  ]);

  if (searchResults.length === 0) {
    return null;
  }

  const product = Object.values(searchResults).find(
    (product) => product.name === productName
  );

  if (
    product &&
    (searchResults.length === 1 || product.name!.split(" ").length >= 3)
  ) {
    const foodElement = {
      ...product,
    };
    return [foodElement];
  }

  return searchResults;
}

export async function calculateDailyConsumption(
  product: FoodElement,
  dailyState: DailyFood,
  ctx: Scenes.WizardContext,
  tgId: number
): Promise<void> {
  const mass = dailyState.mass;
  const productName = product.name;
  const date = dailyState.dateOfConsumption;

  const sumNutrition =
    product.protein * mass + product.totalFat * mass + product.carbs * mass;

  if (sumNutrition === 0) {
    const nutritionDetails = {
      dateOfConsumption: date,
      name: productName,
      mass: mass,
      kcal: 0,
      protein: 0,
      saturatedFat: 0,
      unsaturatedFat: 0,
      totalFat: 0,
      carbs: 0,
      fiber: 0,
      tgId: tgId,
    };

    const newDate = new dailyFoodBase(nutritionDetails);
    await newDate.save();

    await deleteAndUpdateBotMessage(
      ctx,
      `Product ${productName} added to daily consumption statistics`
    );

    await ctx.deleteMessage((ctx.wizard.state as DialogueState).botMessageId);
    await ctx.scene.enter("START_CALCULATION");
    return;
  }

  const nutritionDetails = {
    dateOfConsumption: date,
    name: productName,
    mass: mass,

    kcal: roundToThree(product.kcal * mass),
    protein: roundToThree(product.protein * mass),
    saturatedFat: roundToThree(product.saturatedFat * mass),
    unsaturatedFat: roundToThree(product.unsaturatedFat * mass),
    totalFat: roundToThree(product.totalFat * mass),
    carbs: roundToThree(product.carbs * mass),
    fiber: roundToThree(product.fiber * mass),

    tgId: tgId,
  };

  const newDate = new dailyFoodBase(nutritionDetails);
  await newDate.save();
  await deleteAndUpdateBotMessage(
    ctx,
    `Product ${productName} added to daily consumption statistics`
  );
  await ctx.deleteMessage((ctx.wizard.state as DialogueState).botMessageId);
  await ctx.scene.enter("START_CALCULATION");
}

export async function createOrUpdateProductInProductBase(
  foodElement: FoodElement,
  updateCheck: boolean,
  ctx: Scenes.WizardContext
): Promise<void> {
  const filter = { name: foodElement.name, tgId: foodElement.tgId };

  const nutrition = {
    name: foodElement.name,

    kcal: roundToThree(foodElement.kcal),
    protein: roundToThree(foodElement.protein),
    totalFat: roundToThree(foodElement.totalFat),
    saturatedFat: roundToThree(foodElement.saturatedFat),
    unsaturatedFat: roundToThree(foodElement.unsaturatedFat),
    carbs: roundToThree(foodElement.carbs),
    fiber: roundToThree(foodElement.fiber),

    proteinPercent: calculatePercentageOfNutrient(
      foodElement.protein,
      foodElement
    ),
    totalFatPercent: calculatePercentageOfNutrient(
      foodElement.totalFat,
      foodElement
    ),
    carbPercent: calculatePercentageOfNutrient(foodElement.carbs, foodElement),

    satFatPercent: calculateFatTypePercentage(
      foodElement.saturatedFat,
      foodElement.totalFat
    ),
    unsatFatPercent: calculateFatTypePercentage(
      foodElement.unsaturatedFat,
      foodElement.totalFat
    ),

    tgId: foodElement.tgId,
  };

  if (updateCheck === true) {
    await productBase.findOneAndUpdate(
      filter,
      { $set: nutrition },
      {
        new: true,
        runValidators: true,
      }
    );
    await ctx.reply(`Product ${foodElement.name} was updated in the database.`);
  } else {
    const newProduct = new productBase(nutrition);

    await newProduct.save();
    await ctx.reply(`Product ${nutrition.name} was created in the database.`);
  }

  await ctx.scene.enter("START_CALCULATION");
}

export async function existanceOfUser(userId: number): Promise<boolean> {
  const existance = await userBase.findOne({
    tgId: userId,
  });

  if (existance) {
    return true;
  }
  return false;
}

export async function getConsumptionStatisticByDateAnTgId(
  tgId: number,
  checkForList: boolean,
  startDate: string,
  endDate: string,
  ctx: Scenes.WizardContext
): Promise<void> {
  const customDateString = formatDate(new Date(startDate));

  const filter = {
    dateOfConsumption: { $gte: startDate, $lt: endDate },
    tgId: tgId,
  };

  const foods = await dailyFoodBase.find(filter);

  if (foods.length === 0) {
    await ctx.reply("You don't have any consumption records in this day");
    ctx.scene.enter("START_CALCULATION");
    return;
  }

  if (checkForList) {
    let productInfo = `List of consumed products (for ${customDateString}):\n`;
    foods.forEach((food) => {
      productInfo += `${food.name}: ${food.mass} g\n`;
    });

    await ctx.reply(productInfo);
    ctx.scene.enter("START_CALCULATION");
    return;
  }

  const totals = foods.reduce(
    (accumulator, food) => {
      accumulator.mass += food.mass;
      accumulator.kcal += food.kcal;
      accumulator.protein += food.protein;
      accumulator.totalFat += food.totalFat;
      accumulator.saturatedFat += food.saturatedFat;
      accumulator.unsaturatedFat += food.unsaturatedFat;
      accumulator.carbs += food.carbs;
      accumulator.fiber += food.fiber;

      return accumulator;
    },
    {
      mass: 0,
      kcal: 0,
      protein: 0,
      totalFat: 0,
      saturatedFat: 0,
      unsaturatedFat: 0,
      carbs: 0,
      proteinPercent: 0,
      totalFatPercent: 0,
      carbPercent: 0,
      fiber: 0,
      satFatPercent: 0,
      unsatFatPercent: 0,
      tgId: tgId,
    }
  );

  totals.proteinPercent = calculatePercentageOfNutrient(totals.protein, totals);

  totals.totalFatPercent = calculatePercentageOfNutrient(
    totals.totalFat,
    totals
  );

  totals.carbPercent = calculatePercentageOfNutrient(totals.carbs, totals);

  totals.satFatPercent = calculatePercentageOfNutrient(
    totals.saturatedFat,
    totals
  );

  totals.unsatFatPercent = calculatePercentageOfNutrient(
    totals.unsaturatedFat,
    totals
  );

  const productInfo = `
Date of consumption: ${customDateString}
Calories: ${Math.round(totals.kcal)}
-------------------
Nutritions in gram:

Proteins: ${Math.round(totals.protein)}g
Total Fat: ${Math.round(totals.totalFat)}g
Carbohydrates: ${Math.round(totals.carbs)}g
Fiber: ${Math.round(totals.fiber)}g
-------------------
Nutritions in perecents:

Proteins: ${totals.proteinPercent}%
Total Fat: ${totals.totalFatPercent}%
Carbohydrates: ${totals.carbPercent}%
-------------------
Type of fats in percents:

Saturated fats: ${totals.satFatPercent}%
Unsaturated fats: ${totals.unsatFatPercent}%`;

  await ctx.reply(productInfo);
  ctx.scene.enter("START_CALCULATION");
  return;
}

export async function deleteConsumptionStatisticByDateAnTgId(
  startDate: string,
  endDate: string,
  tgId: number
) {
  const filter = {
    dateOfConsumption: { $gte: startDate, $lt: endDate },
    tgId: tgId,
  };

  const foods: FoodElement[] = await dailyFoodBase.find(filter).lean();
  return foods;
}

export async function findTopTenProducts(typeOfCheck: string) {
  const foods = await productBase.find({});

  const calculated = foods
    .filter((food) => {
      return food.protein !== 0;
    })
    .map((food) => {
      return {
        name: food.name,
        kcalPerFiberGram: food.kcal / food.protein,
        kcal: food.kcal,
        fiber: food.fiber,
      };
    });

  const sorted = calculated.sort(
    (a, b) => a.kcalPerFiberGram - b.kcalPerFiberGram
  );

  const topTen = sorted.slice(0, 20);

  console.log(topTen);
}

export async function deleteAndUpdateBotMessageCreate(
  ctx: Scenes.WizardContext,
  button?: ButtonType
): Promise<void> {
  await ctx.deleteMessage(ctx.message!.message_id);

  const message =
    `**${
      (ctx.wizard.state as DailyFood).name
    }** doesn't exist in product database\n\n` +
    `**Create** - to create **${
      (ctx.wizard.state as DailyFood).name
    }** in product database\n` +
    "Or just enter name of another product to try again";

  await ctx.telegram.editMessageText(
    ctx.chat!.id,
    (ctx.wizard.state as DialogueState).botMessageId,
    undefined,
    message,
    button
  );
}

export async function deleteAndUpdateBotMessage(
  ctx: Scenes.WizardContext,
  message: string,
  button?: ButtonType
): Promise<void> {
  if (ctx.message) {
    await ctx.deleteMessage(ctx.message.message_id);
  }

  await ctx.telegram.editMessageText(
    ctx.chat!.id,
    (ctx.wizard.state as DialogueState).botMessageId,
    undefined,
    message,
    button
  );
}