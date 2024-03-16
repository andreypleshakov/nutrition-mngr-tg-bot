import { FoodElement, CombinedProduct, DailyFood } from "./models";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

export const serviceAccountAuth = new JWT({
  email: process.env.NUTRITION_MGR_EMAIL,
  keyFile: process.env.NUTRITION_MGR_KEY_FILE,

  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetID =
  process.env.SPREADSHEET_ID !== undefined ? process.env.SPREADSHEET_ID : "";

export const doc = new GoogleSpreadsheet(spreadsheetID, serviceAccountAuth);

export const doneButton = {
  reply_markup: {
    inline_keyboard: [[{ text: "Done", callback_data: "bot-done" }]],
  },
};

export const nextStep = {
  reply_markup: {
    inline_keyboard: [[{ text: "Next", callback_data: "bot-next" }]],
  },
};

export const yesOrNoButton = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "yes", callback_data: "bot-yes" },
        { text: "no", callback_data: "bot-no" },
      ],
    ],
  },
};

export function getFixButtonProductBase(state: FoodElement) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Product Name", callback_data: state.name },
          { text: "Calories", callback_data: `${state.kcal}` },
          { text: "Proteins", callback_data: `${state.protein}` },
          {
            text: "Saturated fats",
            callback_data: `${state.saturated_fat}`,
          },
          {
            text: "Unsaturated fats",
            callback_data: `${state.unsaturated_fat}`,
          },
          { text: "Carbohydrates", callback_data: `${state.carbs}` },
        ],
      ],
    },
  };
}

export async function calculateNutrition(
  productName: string,
  mass: number
): Promise<DailyFood | null> {
  await doc.loadInfo();
  const sheetBase = doc.sheetsByTitle["products_database"];
  const baseRows = await sheetBase.getRows();
  const targetBaseRow = baseRows.find((row) => row.get("name") === productName);

  if (targetBaseRow) {
    const kcal = parseInt(targetBaseRow.get("kcal_per_1_gram")) * mass;
    const protein = targetBaseRow.get("protein_per_1_gram") * mass;
    const saturated_fat = targetBaseRow.get("sat_fat_per_1_gram") * mass;
    const unsaturated_fat = targetBaseRow.get("unsat_fat_per_1_gram") * mass;
    const carbs = targetBaseRow.get("carbs_per_1_gram") * mass;
    const totalFat = saturated_fat + unsaturated_fat;

    const nutrition = {} as DailyFood;
    (nutrition.kcal = kcal),
      (nutrition.protein = protein),
      (nutrition.totalFat = totalFat),
      (nutrition.saturated_fat = saturated_fat),
      (nutrition.unsaturated_fat = unsaturated_fat),
      (nutrition.carbs = carbs);

    return nutrition;
  }

  return null;
}

export async function addCalculatedNutrition(
  nutrition: DailyFood,
  date: string
): Promise<void> {
  const sheetDaily = doc.sheetsByTitle["daily_statistics"];
  const dailyRows = await sheetDaily.getRows();
  const targetDailyRow = dailyRows.find((row) => row.get("date") === date);

  if (targetDailyRow) {
    const existingKcal = targetDailyRow.get("kcal");
    const existingProtein = targetDailyRow.get("protein (g)");
    const existingTotal_fat = targetDailyRow.get("total_fat (g)");
    const existingCarbs = targetDailyRow.get("carbohydrates (g)");

    nutrition.kcal += existingKcal;
    nutrition.protein += existingProtein;
    nutrition.totalFat += existingTotal_fat;
    nutrition.carbs += existingCarbs;

    await targetDailyRow.delete();
  }
  const sumNutrition = nutrition.protein + nutrition.totalFat + nutrition.carbs;

  const DailyFoodElement = await sheetDaily.addRow([
    date,
    nutrition.kcal,
    nutrition.protein,
    nutrition.totalFat,
    nutrition.carbs,
    (nutrition.proteinPercent = (nutrition.protein / sumNutrition) * 100),
    (nutrition.totalFatPercent = (nutrition.totalFat / sumNutrition) * 100),
    (nutrition.carbPercent = (nutrition.carbs / sumNutrition) * 100),
    (nutrition.satFatPercent =
      (nutrition.saturated_fat / nutrition.totalFat) * 100),
    (nutrition.unsatFatPercent =
      (nutrition.unsaturated_fat / nutrition.totalFat) * 100),
  ]);

  await DailyFoodElement.save();
}

export async function existenceOfTheSameProduct(
  productName: string
): Promise<boolean> {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["products_database"];

  for (let i = 0; i < 50; i++) {
    const rows = await sheet.getRows({
      offset: i * 10,
      limit: 10,
    });

    const row = rows.find((row) => row.get("name") === productName);

    if (rows.length == 0) {
      return false;
    }
    if (row) {
      return true; // Product exists
    }
  }
  return false; // Product does not exist
}

export async function getProductDetails(
  productName: string
): Promise<FoodElement | null> {
  await doc.loadInfo();
  const sheetBase = doc.sheetsByTitle["products_database"];
  const baseRows = await sheetBase.getRows();
  const targetBaseRow = baseRows.find((row) => row.get("name") === productName);
  if (targetBaseRow) {
    const nutrition = {} as FoodElement;
    (nutrition.kcal = targetBaseRow.get("kcal_per_1_gram")),
      (nutrition.protein = targetBaseRow.get("protein_per_1_gram")),
      (nutrition.saturated_fat = targetBaseRow.get("sat_fat_per_1_gram")),
      (nutrition.unsaturated_fat = targetBaseRow.get("unsat_fat_per_1_gram")),
      (nutrition.carbs = targetBaseRow.get("carbs_per_1_gram"));
    return nutrition;
  }
  return null;
}

export async function replaceProductData(product: FoodElement): Promise<void> {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["products_database"];

  for (let i = 0; i < 50; i++) {
    const rows = await sheet.getRows({
      offset: i * 10,
      limit: 10,
    });

    const row = rows.find((row) => row.get("name") === product.name);

    if (row) {
      row.assign({
        name: product.name,
        kcal_per_1_gram: product.kcal,
        protein_per_1_gram: product.protein,
        sat_fat_per_1_gram: product.saturated_fat,
        unsat_fat_per_1_gram: product.unsaturated_fat,
        carbs_per_1_gram: product.carbs,
      });

      await row.save();
    }
  }
}
export async function addElementToSheet(
  foodElement: FoodElement
): Promise<void> {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["products_database"];

  const { name, kcal, protein, saturated_fat, unsaturated_fat, carbs } =
    foodElement;
  const addFoodElemnt = await sheet.addRow([
    name,
    kcal,
    protein,
    saturated_fat,
    unsaturated_fat,
    carbs,
  ]);
  await addFoodElemnt.save();
}

export async function getDailyStatistic(
  date: string
): Promise<DailyFood | null> {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle["daily_statistics"];
  const rows = await sheet.getRows();
  const row = rows.find((row) => row.get("date") === date);

  if (row) {
    const dailyStat = {} as DailyFood;
    (dailyStat.dateOfDaily = row.get("date")),
      (dailyStat.kcal = row.get("kcal")),
      (dailyStat.protein = row.get("protein (g)")),
      (dailyStat.totalFat = row.get("total_fat (g)")),
      (dailyStat.carbs = row.get("carbohydrates (g)")),
      (dailyStat.proteinPercent = row.get("protein (%)")),
      (dailyStat.totalFatPercent = row.get("fat (%)")),
      (dailyStat.carbPercent = row.get("carbohydrates (%)")),
      (dailyStat.satFatPercent = row.get("saturated_fat (%)")),
      (dailyStat.unsatFatPercent = row.get("unsaturated_fat (%)"));
    return dailyStat;
  }

  return null;
}

export function isValidDateFormat(date: string): boolean {
  const datePattern = /^\d{2}.\d{2}.\d{4}$/;

  if (!date.match(datePattern)) {
    return false;
  }
  return true;
}

export function getYesOrNoButton(ctx: any): boolean {
  if (
    ctx.callbackQuery !== undefined &&
    (ctx.callbackQuery as any).data === "bot-yes"
  ) {
    return true;
  }
  return false;
}

export function isDoneButton(ctx: any): boolean {
  if (
    ctx.callbackQuery !== undefined &&
    (ctx.callbackQuery as any).data === "bot-done"
  ) {
    return true;
  }
  return false;
}
export function textIsNumber(text: string): boolean {
  const num = parseInt(text);
  if (text === undefined || isNaN(num) || num < 0) {
    return false;
  }

  return true;
}

export function combineNutrition(combinedProduct: CombinedProduct) {
  let resultProduct: FoodElement = {
    name: combinedProduct.CombinedName,
    mass: combinedProduct.CombinedMass,
    kcal: 0,
    protein: 0,
    saturated_fat: 0,
    unsaturated_fat: 0,
    carbs: 0,
  };

  Object.keys(combinedProduct.products).forEach((productName) => {
    const product = combinedProduct.products[productName];
    console.log(
      `Product: ${product.name}, 
        Mass: ${product.mass}, 
        Kcal: ${product.kcal}, 
        Protein: ${product.protein}, 
        Saturated fat: ${product.saturated_fat}, 
        Unsaturated fat: ${product.unsaturated_fat}, 
        Carbs: ${product.carbs}`
    );

    resultProduct.kcal += product.kcal * product.mass;
    resultProduct.protein += product.protein * product.mass;
    resultProduct.saturated_fat += product.saturated_fat * product.mass;
    resultProduct.unsaturated_fat += product.unsaturated_fat * product.mass;
    resultProduct.carbs += product.carbs * product.mass;
  });

  const mass = combinedProduct.CombinedMass;
  resultProduct.kcal = resultProduct.kcal / mass;
  resultProduct.protein = resultProduct.protein / mass;
  resultProduct.saturated_fat = resultProduct.saturated_fat / mass;
  resultProduct.unsaturated_fat = resultProduct.unsaturated_fat / mass;
  resultProduct.carbs = resultProduct.carbs / mass;

  return resultProduct;
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
  return parseFloat(input.replace(",", "."));
}

///////////////////////
//: Record<Exclude<keyof FoodElement, 'mass'>, string>
const FIELD_TO_PRODUCT_INFO: Record<string, string> = {
  name: "Product name",
  kcal: "Calories",
  protein: "Proteins",
  saturated_fat: "Saturated fats",
  unsaturated_fat: "Unsaturated fats",
  carbs: "Carbohydrates",
};

// getFormatedText(state, FIELD_TO_PRODUCT_INFO)

function getProductInfoString(state: FoodElement): string {
  const keys = Object.keys(state);
  const data = keys.map((key): [string, string | number] => {
    return [FIELD_TO_PRODUCT_INFO[key], state[key as keyof FoodElement]];
  });
  return getFormatedString(data);
}

function getFormatedString(arrayOfData: [string, string | number][]) {
  return arrayOfData
    .map(([name, value]) => {
      return `${name}: ${value}`;
    })
    .join("\n");
}
