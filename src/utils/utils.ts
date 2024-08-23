import {
  FoodElement,
  CombinedProduct,
  DailyFood,
  DialogueState,
  CostOfProtein,
} from "./models";
import { userBase, dailyFoodBase, productBase } from "./schemas";
import { Scenes, Markup } from "telegraf";
// import { fixingSomethingAndFinalStep } from "../scenes/createProduct";
import { getfixButtonProductBase } from "./buttons";

export function calculationOfCostProtein(actualState: CostOfProtein): number {
  const amountOfProtein = actualState.protein / actualState.massScope;
  const costOfGram = actualState.cost / actualState.totalMass;
  const costForOneGramOfProtein = costOfGram / amountOfProtein;
  return costForOneGramOfProtein;
  //TO DO
}

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
    saturated_fat: 0,
    unsaturated_fat: 0,
    carbs: 0,
    fiber: 0,

    tgId: combinedProduct.tgId,
  };

  Object.keys(combinedProduct.products).forEach((productName) => {
    const product = combinedProduct.products[productName];

    resultProduct.kcal += product.kcal * product.mass;
    resultProduct.protein += product.protein * product.mass;
    resultProduct.totalFat += product.totalFat * product.mass;
    resultProduct.saturated_fat += product.saturated_fat * product.mass;
    resultProduct.unsaturated_fat += product.unsaturated_fat * product.mass;
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
  perGramResultProduct.saturated_fat =
    perGramResultProduct.saturated_fat / perGramResultProduct.mass;
  perGramResultProduct.unsaturated_fat =
    perGramResultProduct.unsaturated_fat / perGramResultProduct.mass;
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
  productName: string,
  tgId: number
): Promise<boolean> {
  const existance = await productBase.findOne({
    name: productName,
    tgId: tgId,
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
    (nutrition.saturated_fat = product!.saturated_fat),
    (nutrition.unsaturated_fat = product!.unsaturated_fat),
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
    // ctx.wizard.selectStep(fixingSomethingAndFinalStep);
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
  const saturatedFat = roundToThree(foodElement.saturated_fat);
  const unsaturatedFat = roundToThree(foodElement.unsaturated_fat);
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
    saturated_fat: saturatedFat,
    unsaturated_fat: unsaturatedFat,
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
  productName: string,
  tgId: number
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
    {
      $match: {
        tgId: tgId,
      },
    },
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
  ctx: Scenes.WizardContext
): Promise<void> {
  const mass = dailyState.mass;
  const productName = product.name;
  const date = dailyState.dateOfConsumption;
  const tgId = product.tgId;

  const sumNutrition =
    product.protein * mass + product.totalFat * mass + product.carbs * mass;

  if (sumNutrition === 0) {
    const nutritionDetails = {
      dateOfConsumption: date,
      name: productName,
      mass: mass,

      kcal: 0,
      protein: 0,
      saturated_fat: 0,
      unsaturated_fat: 0,
      totalFat: 0,
      carbs: 0,

      tgId: tgId,
    };

    const newDate = new dailyFoodBase(nutritionDetails);
    await newDate.save();
    await ctx.reply(
      `Product ${productName} added to daily consumption statistics`
    );
    await ctx.scene.enter("START_CALCULATION");
  }
  const nutritionDetails = {
    dateOfConsumption: date,
    name: productName,
    mass: mass,

    kcal: roundToThree(product.kcal * mass),
    protein: roundToThree(product.protein * mass),
    saturated_fat: roundToThree(product.saturated_fat * mass),
    unsaturated_fat: roundToThree(product.unsaturated_fat * mass),
    totalFat: roundToThree(product.totalFat * mass),
    carbs: roundToThree(product.carbs * mass),

    tgId: tgId,
  };

  const newDate = new dailyFoodBase(nutritionDetails);
  await newDate.save();
  await ctx.reply(
    `Product ${productName} added to daily consumption statistics`
  );
  await ctx.scene.enter("START_CALCULATION");
}

export async function addOrCreateCalculatedNutrition(
  nutrition: DailyFood,
  date: Date,
  productName: string,
  mass: number,
  tgId: number
): Promise<void> {
  const sumNutrition = nutrition.protein + nutrition.totalFat + nutrition.carbs;

  const newDate = new dailyFoodBase({
    dateOfConsumption: date,
    name: productName,
    mass: mass,
    kcal: nutrition.kcal,
    protein: nutrition.protein,
    saturated_fat: nutrition.saturated_fat,
    unsaturated_fat: nutrition.unsaturated_fat,
    totalFat: nutrition.totalFat,
    carbs: nutrition.carbs,
    proteinPercent: (nutrition.protein / sumNutrition) * 100,
    totalFatPercent: (nutrition.totalFat / sumNutrition) * 100,
    carbPercent: (nutrition.carbs / sumNutrition) * 100,
    satFatPercent: (nutrition.saturated_fat / nutrition.totalFat) * 100,
    unsatFatPercent: (nutrition.unsaturated_fat / nutrition.totalFat) * 100,
    tgId: tgId,
  });

  await newDate.save();
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
    saturated_fat: roundToThree(foodElement.saturated_fat),
    unsaturated_fat: roundToThree(foodElement.unsaturated_fat),
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
      foodElement.saturated_fat,
      foodElement.totalFat
    ),
    unsatFatPercent: calculateFatTypePercentage(
      foodElement.unsaturated_fat,
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
    await ctx.reply("Product data was updated in the database.");
  } else {
    const newProduct = new productBase(nutrition);

    await newProduct.save();
    await ctx.reply(`Product ${nutrition.name} was created in the database.`);
  }

  await ctx.scene.enter("START_CALCULATION");
}

export async function existanceOfUser(
  userId: number,
  userName: string
): Promise<boolean> {
  const existance = await userBase.findOne({
    tgId: userId,
    tgUserName: userName,
  });

  if (existance) {
    return true;
  }
  return false;
}

export async function getConsumptionStatisticByDateAnTgId(
  tgId: number,
  checkForList: boolean,
  startDate: Date,
  endDate: Date,
  ctx: Scenes.WizardContext
): Promise<void> {
  const customDateString = formatDate(startDate);

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
      accumulator.saturated_fat += food.saturated_fat;
      accumulator.unsaturated_fat += food.unsaturated_fat;
      accumulator.carbs += food.carbs;
      accumulator.fiber += food.fiber;

      return accumulator;
    },
    {
      mass: 0,

      kcal: 0,
      protein: 0,
      totalFat: 0,
      saturated_fat: 0,
      unsaturated_fat: 0,
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
    totals.saturated_fat,
    totals
  );

  totals.unsatFatPercent = calculatePercentageOfNutrient(
    totals.unsaturated_fat,
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
  startDate: Date,
  endDate: Date,
  tgId: number
) {
  const filter = {
    dateOfConsumption: { $gte: startDate, $lt: endDate },
    tgId: tgId,
  };

  const foods = await dailyFoodBase.find(filter);

  const updatedFoods: FoodElement[] = foods.map(
    ({
      _id,
      name,
      mass,
      kcal,
      protein,
      saturated_fat,
      unsaturated_fat,
      totalFat,
      carbs,
      fiber,
      tgId,
    }) => ({
      _id,
      name,
      mass,
      kcal,
      protein,
      saturated_fat,
      unsaturated_fat,
      totalFat,
      carbs,
      fiber,
      tgId,
    })
  );

  return updatedFoods;
}
