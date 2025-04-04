export type IUser = {
  tgId: number;
  tgUserName?: string;
};

export type IProduct = IUser & {
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
  status?: "primal" | "custom";
  typeOfFood?: "product" | "meal";
};

export type IProductRaiting = IProduct & {
  kcalPerProtein: number;
  kcalPerFiber: number;
};

export type IDialogueState = Pick<IProduct, "name" | "tgId"> & {
  updateProduct: boolean;
  fromDailyProduct: boolean;
  fromFixingStep: boolean;
  fromStartingScene: boolean;
  fromPreparationToDelete: boolean;
  checkForCombined: boolean;
  listOfProducts: boolean;
  deleteConsumption: boolean;
  customMass: number;
  botMessageId: number;
  fromValidation: boolean;
  arrayOfProducts: IProduct[];
  arrayForDelete: string[];
  mainMessageId: number;
};

export type ICostOfProtein = {
  nameOfProduct: string;
  nameOfCurrency: string;
  cost: number;
  protein: number;
  massScope: number;
  totalMass: number;
};

export type IConsumedProduct = IProduct & {
  dateOfConsumption: string;
};

export type IMeal = IDialogueState & {
  MealName: string;
  MealMass: number;
  products: Record<string, IProduct>;
  actualProductName: string;
  actualProductMass: number;
  arrayOfProducts: IProduct[];
};

export type IPrimalProduct = IProduct & {
  allowedUsersTgId: number[];
};

export type InitialState = {
  mainMessageId: number;
  fromStartingScene: true;
};

export type ButtonType = {
  reply_markup: {
    inline_keyboard: {
      text: string;
      callback_data: string;
    }[][];
  };
};
