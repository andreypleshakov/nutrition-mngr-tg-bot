import { Middleware, Scenes } from "telegraf";
import {
  startingDialogue,
  waitingForProductName,
  isUpdatingTheProduct,
  kcalsPerGram,
  proteinsPerGram,
  saturatedFatPerGram,
  unsaturatedFatPerGram,
  carbohydratesPerGram,
  fixingSomethingAndFinal,
  perHundredOrCustomMass,
  customMass,
  totalFatPerGram,
  fiberPerGram,
} from "../scenes/createProduct";

export const createProductStepsList: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  waitingForProductName,
  perHundredOrCustomMass,
  customMass,
  isUpdatingTheProduct,
  kcalsPerGram,
  proteinsPerGram,
  totalFatPerGram,
  saturatedFatPerGram,
  unsaturatedFatPerGram,
  carbohydratesPerGram,
  fixingSomethingAndFinal,
  fiberPerGram,
];

export const steps = createProductStepsList.reduce((acc, step, index) => {
  acc[(step as Function).name] = index;
  return acc;
}, {} as Record<string, number>);
