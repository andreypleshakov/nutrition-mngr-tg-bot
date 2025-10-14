"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productsController_1 = require("./productsController");
const router = express_1.default.Router();
router.get("/:tgId", productsController_1.getProducts);
exports.default = router;
