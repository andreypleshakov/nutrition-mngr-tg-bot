export interface users {
  tgId: number;
  tgUserName?: string;
}

export interface FoodElement extends users {
  _id?: string;
  documentId?: string;
  name?: string;
  mass: number;
  kcal: number;
  protein: number;
  totalFat: number;
  saturated_fat: number;
  unsaturated_fat: number;
  carbs: number;
}

export interface DialogueState extends FoodElement {
  updateProduct: boolean;

  fromDailyProduct: boolean;
  fromCombinedProduct: boolean;
  fromFixingStep: boolean;
  fromStartingScene: boolean;

  checkForCombined: boolean;

  listOfProducts: boolean;

  deleteConsumption: boolean;

  customMass: number;
}

export interface CostOfProtein {
  nameOfProduct: string;
  nameOfCurrency: string;
  cost: number;
  protein: number;
  massScope: number;
  totalMass: number;
}

export interface DailyFood extends FoodElement {
  dateOfConsumption: Date;

  arrayOfProducts: any[];
  objectProduct: {};
}

export interface CombinedProduct extends DialogueState {
  CombinedName: string;
  CombinedMass: number;

  products: Record<string, FoodElement>;
  actualProductName: string;
  actualProductMass: number;
}
