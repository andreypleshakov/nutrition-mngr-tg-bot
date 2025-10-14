"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.steps = exports.oneProteinsGramCostStepsList = void 0;
const oneProteinsGramCost_1 = require("../scenes/oneProteinsGramCost");
exports.oneProteinsGramCostStepsList = [
    oneProteinsGramCost_1.startingDialogue,
    oneProteinsGramCost_1.nameOfProduct,
    oneProteinsGramCost_1.perHundredOrCustomMass,
    oneProteinsGramCost_1.customMass,
    oneProteinsGramCost_1.proteinPerSelectedMass,
    oneProteinsGramCost_1.totalMassOfProduct,
    oneProteinsGramCost_1.costOfProduct,
    oneProteinsGramCost_1.finalCalculation,
];
exports.steps = exports.oneProteinsGramCostStepsList.reduce((acc, step, index) => {
    acc[step.name] = index;
    return acc;
}, {});
