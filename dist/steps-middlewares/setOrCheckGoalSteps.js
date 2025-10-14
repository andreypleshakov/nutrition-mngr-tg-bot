"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.steps = exports.setOrCheckGoalStepsList = void 0;
const setOrCheckGoal_1 = require("../scenes/setOrCheckGoal");
exports.setOrCheckGoalStepsList = [
    setOrCheckGoal_1.startingDialogue,
    setOrCheckGoal_1.setKcal,
    setOrCheckGoal_1.setProtein,
    setOrCheckGoal_1.setTotalFat,
    setOrCheckGoal_1.setSatFat,
    setOrCheckGoal_1.setUnsatFat,
    setOrCheckGoal_1.setCarbs,
    setOrCheckGoal_1.setFiber,
];
exports.steps = exports.setOrCheckGoalStepsList.reduce((acc, step, index) => {
    acc[step.name] = index;
    return acc;
}, {});
