import { Middleware, Scenes } from "telegraf";
import {
  customDateForStatistic,
  deleteConsumedProduct,
  optionsOfDateStatistic,
  startingDialogue,
  typeOfStatistic,
  startDateForRange,
  endDateForRange,
  selectRangeType,
  selectWeek,
  selectMonth,
} from "../scenes/checkOrDeleteConsumptionStatistic";

export const manipulateConsumptionStatisticStepsList: Middleware<Scenes.WizardContext>[] =
  [
    startingDialogue,
    optionsOfDateStatistic,
    customDateForStatistic,
    selectRangeType,
    startDateForRange,
    endDateForRange,
    selectWeek,
    selectMonth,
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
