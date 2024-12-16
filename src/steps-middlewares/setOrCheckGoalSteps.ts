import { Middleware, Scenes } from "telegraf";
import { setCarbs, setFiber, setKcal, setProtein, setSatFat, setTotalFat, setUnsatFat, startingDialogue } from "../scenes/setOrCheckGoal";

export const setOrCheckGoalStepsList: Middleware<Scenes.WizardContext>[] = [
    startingDialogue,
    setKcal,
    setProtein,
    setTotalFat,
    setSatFat,
    setUnsatFat,
    setCarbs,
    setFiber
];

export const steps = setOrCheckGoalStepsList.reduce((acc, step, index) => {
  acc[(step as Function).name] = index;
  return acc;
}, {} as Record<string, number>);
