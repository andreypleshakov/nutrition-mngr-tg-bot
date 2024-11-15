import { Middleware, Scenes } from "telegraf";
import {
  customDateForStatistic,
  deleteConsumedProduct,
  optionsOfDateStatistic,
  startingDialogue,
  typeOfStatistic,
} from "../scenes/checkOrDeleteConsumptionStatistic";

export const manipulateConsumptionStatisticStepsList: Middleware<Scenes.WizardContext>[] =
  [
    startingDialogue,
    optionsOfDateStatistic,
    customDateForStatistic,
    typeOfStatistic,
    deleteConsumedProduct,
  ];

export const steps = manipulateConsumptionStatisticStepsList.reduce(
  (acc, step, index) => {
    acc[(step as Function).name] = index;
    return acc;
  },
  {} as Record<string, number>
);

