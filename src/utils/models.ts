export interface users {
  tgId: number;
  tgUserName?: string;
}

export interface FoodElement extends users {
  _id?: string;
  name?: string;
  mass: number;
  kcal: number;
  protein: number;
  totalFat: number;
  saturatedFat: number;
  unsaturatedFat: number;
  carbs: number;
  fiber: number;
}

export interface ProductRaiting extends FoodElement {
  kcalPerProtein: number;
  kcalPerFiber: number;
}

export interface DialogueState extends FoodElement {
  updateProduct: boolean;
  fromDailyProduct: boolean;
  fromCombinedProduct: boolean;
  fromFixingStep: boolean;
  fromStartingScene: boolean;
  fromPreparationToDelete: boolean;
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
  arrayOfProducts: FoodElement[];
  arrayForDelete: string[];
  objectProduct: {};
}

export interface CombinedProduct extends DialogueState {
  CombinedName: string;
  CombinedMass: number;
  products: Record<string, FoodElement>;
  actualProductName: string;
  actualProductMass: number;
  arrayOfProducts: FoodElement[];
}
