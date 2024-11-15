import { Middleware, Scenes } from "telegraf";
import {
  costOfProduct,
  customMass,
  finalCalculation,
  nameOfProduct,
  perHundredOrCustomMass,
  proteinPerSelectedMass,
  startingDialogue,
  totalMassOfProduct,
} from "../scenes/oneProteinsGramCost";

export const oneProteinsGramCostStepsList: Middleware<Scenes.WizardContext>[] =
  [
    startingDialogue,
    nameOfProduct,
    perHundredOrCustomMass,
    customMass,
    proteinPerSelectedMass,
    totalMassOfProduct,
    costOfProduct,
    finalCalculation,
  ];

export const steps = oneProteinsGramCostStepsList.reduce((acc, step, index) => {
  acc[(step as Function).name] = index;
  return acc;
}, {} as Record<string, number>);
