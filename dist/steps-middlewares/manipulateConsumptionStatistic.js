"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.steps = exports.manipulateConsumptionStatisticStepsList = void 0;
const checkOrDeleteConsumptionStatistic_1 = require("../scenes/checkOrDeleteConsumptionStatistic");
exports.manipulateConsumptionStatisticStepsList = [
    checkOrDeleteConsumptionStatistic_1.startingDialogue,
    checkOrDeleteConsumptionStatistic_1.optionsOfDateStatistic,
    checkOrDeleteConsumptionStatistic_1.customDateForStatistic,
    checkOrDeleteConsumptionStatistic_1.selectRangeType,
    checkOrDeleteConsumptionStatistic_1.startDateForRange,
    checkOrDeleteConsumptionStatistic_1.endDateForRange,
    checkOrDeleteConsumptionStatistic_1.selectWeek,
    checkOrDeleteConsumptionStatistic_1.selectMonth,
    checkOrDeleteConsumptionStatistic_1.typeOfStatistic,
    checkOrDeleteConsumptionStatistic_1.deleteConsumedProduct,
];
exports.steps = exports.manipulateConsumptionStatisticStepsList.reduce((acc, step, index) => {
    acc[step.name] = index;
    return acc;
}, {});
