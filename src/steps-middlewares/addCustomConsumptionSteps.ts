import { Middleware, Scenes } from "telegraf";
import {
  carbs,
  customDate,
  fiber,
  kcal,
  mass,
  protein,
  satAndUnsatFat,
  startingDialogue,
  todayOrCustomDate,
  totalFat,
  waitingForNameAndMassOfProduct,
} from "../scenes/addCustomConsumption";

export const addCustomConsumptionStepsList: Middleware<Scenes.WizardContext>[] =
  [
    startingDialogue,
    todayOrCustomDate,
    customDate,
    waitingForNameAndMassOfProduct,
    mass,
    kcal,
    protein,
    totalFat,
    satAndUnsatFat,
    carbs,
    fiber,
  ];

export const steps = addCustomConsumptionStepsList.reduce(
  (acc, step, index) => {
    acc[(step as Function).name] = index;
    return acc;
  },
  {} as Record<string, number>
);
