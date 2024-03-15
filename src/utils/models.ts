export interface DialogueState extends FoodElement {
  updateProduct: boolean;
  fromDailyProduct: boolean;
  fromCombinedProduct: boolean;
  
}

export interface FoodElement {
  name: string;
  mass: number;
  kcal: number;
  saturated_fat: number;
  unsaturated_fat: number;
  protein: number;
  carbs: number;
}

export interface DailyFood extends FoodElement {
  dateOfDaily: string;
  name: string;
  mass: number;
  totalFat: number;
  proteinPercent: number;
  totalFatPercent: number;
  carbPercent: number;
  satFatPercent: number;
  unsatFatPercent: number;
}

export interface CombinedProduct {
  CombinedName: string;
  CombinedMass: number;

  products: { [productName: string]: FoodElement };
  actualProductName: string;

  existanceCombined: boolean;
}
