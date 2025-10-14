"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyStat = getDailyStat;
exports.deleteDailyStat = deleteDailyStat;
exports.postDailyStat = postDailyStat;
const statisticService_1 = require("./statisticService");
function getDailyStat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tgId = parseInt(req.params.tgId, 10);
        const { startDate, endDate } = req.query;
        const dailyStat = yield (0, statisticService_1.getDailyStatistic)(tgId, startDate, endDate);
        res.json(dailyStat);
    });
}
function deleteDailyStat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tgId = Number(req.params.tgId);
            const id = req.params.documentId;
            const deletedCount = yield (0, statisticService_1.deleteDailyStatistic)(id, tgId);
            if (deletedCount > 0) {
                res.status(200).json({ message: "Daily statistic deleted successfully" });
            }
            else {
                res.status(404).json({ error: "Daily statistic not found" });
            }
        }
        catch (error) {
            console.error("Error deleting daily statistic:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
function postDailyStat(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, statisticService_1.addDailyStatistic)(req.body);
        res.status(200).json({ message: "Data received successfully!" });
    });
}
