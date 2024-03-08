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

export interface DailyFood {
  dateOfDaily: string;
  name: string;
  mass: number;
}

export interface CombinedProduct {
  CombinedName: string;
  CombinedMass: number;

  products: { [productName: string]: FoodElement };
  actualProductName: string;

  existanceCombined: boolean;
}
