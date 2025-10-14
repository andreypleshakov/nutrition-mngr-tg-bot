"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const statisticController_1 = require("../statistic/statisticController");
const router = express_1.default.Router();
router.get("/:tgId", statisticController_1.getDailyStat);
router.delete("/:tgId/:documentId", statisticController_1.deleteDailyStat);
router.post("/:tgId", statisticController_1.postDailyStat);
exports.default = router;
