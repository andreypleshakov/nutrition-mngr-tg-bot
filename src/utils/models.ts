export type Users = {
  tgId: number;
  tgUserName?: string;
};
export type FoodElement = Users & {
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
};
export type ProductRaiting = FoodElement & {
  kcalPerProtein: number;
  kcalPerFiber: number;
};
export type DialogueState = FoodElement & {
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
  botMessageId: number;
  fromValidation: boolean;
  arrayOfProducts: FoodElement[];
  arrayForDelete: string[];
};
export type CostOfProtein = {
  nameOfProduct: string;
  nameOfCurrency: string;
  cost: number;
  protein: number;
  massScope: number;
  totalMass: number;
};
export type DailyFood = FoodElement & {
  dateOfConsumption: string;
};
export type CombinedProduct = DialogueState & {
  CombinedName: string;
  CombinedMass: number;
  products: Record<string, FoodElement>;
  actualProductName: string;
  actualProductMass: number;
  arrayOfProducts: FoodElement[];
};
