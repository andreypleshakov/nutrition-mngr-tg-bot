import { Middleware, Scenes } from "telegraf";
import {
  customDate,
  productOptions,
  startingDialogue,
  todayOrCustomDate,
  waitingForNameAndMassOfProduct,
} from "../scenes/addConsumption";

export const addConsumptionStepsList: Middleware<Scenes.WizardContext>[] = [
  startingDialogue,
  todayOrCustomDate,
  customDate,
  waitingForNameAndMassOfProduct,
  productOptions,
];

export const steps = addConsumptionStepsList.reduce((acc, step, index) => {
  acc[(step as Function).name] = index;
  return acc;
}, {} as Record<string, number>);
