"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.steps = exports.addCustomConsumptionStepsList = void 0;
const addCustomConsumption_1 = require("../scenes/addCustomConsumption");
exports.addCustomConsumptionStepsList = [
    addCustomConsumption_1.startingDialogue,
    addCustomConsumption_1.todayOrCustomDate,
    addCustomConsumption_1.customDate,
    addCustomConsumption_1.waitingForNameAndMassOfProduct,
    addCustomConsumption_1.mass,
    addCustomConsumption_1.kcal,
    addCustomConsumption_1.protein,
    addCustomConsumption_1.totalFat,
    addCustomConsumption_1.satAndUnsatFat,
    addCustomConsumption_1.carbs,
    addCustomConsumption_1.fiber,
];
exports.steps = exports.addCustomConsumptionStepsList.reduce((acc, step, index) => {
    acc[step.name] = index;
    return acc;
}, {});
