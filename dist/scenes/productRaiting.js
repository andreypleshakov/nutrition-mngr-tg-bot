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
exports.productRaiting = void 0;
const telegraf_1 = require("telegraf");
const buttons_1 = require("../utils/buttons");
exports.productRaiting = new telegraf_1.Scenes.WizardScene("PRODUCT_RAITING", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // (ctx.wizard.state as IProductRaiting).tgId = ctx.from!.id;
    yield ctx.reply("Choose type of rating that you want to check", buttons_1.typeOfRaing);
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
        return;
    }
    const callBackData = ctx.callbackQuery.data;
    yield ctx.answerCbQuery();
    switch (callBackData) {
        case "best-protein":
        // return ctx.scene.enter("CREATE_PRODUCT");
        case "best-fiber":
        // return ctx.scene.enter("CREATE_COMBINED_PRODUCT");
    }
}));
