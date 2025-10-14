"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.steps = exports.createProductStepsList = void 0;
const createProduct_1 = require("../scenes/createProduct");
exports.createProductStepsList = [
    createProduct_1.startingDialogue,
    createProduct_1.waitingForProductName,
    createProduct_1.perHundredOrCustomMass,
    createProduct_1.customMass,
    createProduct_1.isUpdatingTheProduct,
    createProduct_1.kcalsPerGram,
    createProduct_1.proteinsPerGram,
    createProduct_1.totalFatPerGram,
    createProduct_1.saturatedFatPerGram,
    createProduct_1.unsaturatedFatPerGram,
    createProduct_1.carbohydratesPerGram,
    createProduct_1.fixingSomethingAndFinal,
    createProduct_1.fiberPerGram,
];
exports.steps = exports.createProductStepsList.reduce((acc, step, index) => {
    acc[step.name] = index;
    return acc;
}, {});
