"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.steps = exports.createCombinedProductStepsList = void 0;
const createCombinedProduct_1 = require("../scenes/createCombinedProduct");
exports.createCombinedProductStepsList = [
    createCombinedProduct_1.startingDialogue,
    createCombinedProduct_1.waitingForCombinedProductName,
    createCombinedProduct_1.isReplaceTheProduct,
    createCombinedProduct_1.waitingForNameAndMassOfProduct,
    createCombinedProduct_1.fixingAndFinal,
    createCombinedProduct_1.fixingMassOfProduct,
    createCombinedProduct_1.replaceAddOrIgnore,
    createCombinedProduct_1.productOptions,
];
exports.steps = exports.createCombinedProductStepsList.reduce((acc, step, index) => {
    acc[step.name] = index;
    return acc;
}, {});
