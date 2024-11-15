import { Middleware, Scenes } from "telegraf";
import {
  fixingAndFinal,
  fixingMassOfProduct,
  isReplaceTheProduct,
  productOptions,
  replaceAddOrIgnore,
  startingDialogue,
  waitingForCombinedProductName,
  waitingForNameAndMassOfProduct,
} from "../scenes/createCombinedProduct";

export const createCombinedProductStepsList: Middleware<Scenes.WizardContext>[] =
  [
    startingDialogue,
    waitingForCombinedProductName,
    isReplaceTheProduct,
    waitingForNameAndMassOfProduct,
    fixingAndFinal,
    fixingMassOfProduct,
    replaceAddOrIgnore,
    productOptions,
  ];

export const steps = createCombinedProductStepsList.reduce(
  (acc, step, index) => {
    acc[(step as Function).name] = index;
    return acc;
  },
  {} as Record<string, number>
);
