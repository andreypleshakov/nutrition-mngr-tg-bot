"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.steps = exports.addConsumptionStepsList = void 0;
const addConsumption_1 = require("../scenes/addConsumption");
exports.addConsumptionStepsList = [
    addConsumption_1.startingDialogue,
    addConsumption_1.todayOrCustomDate,
    addConsumption_1.customDate,
    addConsumption_1.waitingForNameAndMassOfProduct,
    addConsumption_1.productOptions,
];
exports.steps = exports.addConsumptionStepsList.reduce((acc, step, index) => {
    acc[step.name] = index;
    return acc;
}, {});
