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
exports.startCalculation = void 0;
const telegraf_1 = require("telegraf");
const schemas_1 = require("../utils/schemas");
const utils_1 = require("../utils/utils");
const buttons_1 = require("../utils/buttons");
exports.startCalculation = new telegraf_1.Scenes.WizardScene("START_CALCULATION", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.from) {
        const { id: userId, username: userName } = ctx.from;
        try {
            const existance = yield (0, utils_1.existanceOfUser)(userId);
            if (!existance) {
                const userData = Object.assign({ tgId: userId }, (userName && { tgUserName: userName }));
                const newUser = new schemas_1.User(userData);
                yield newUser.save();
                yield schemas_1.PrimalProduct.updateMany({}, { $addToSet: { allowedUsersTgId: userId } });
                yield ctx.reply("Select scene that you want to enter", buttons_1.sceneButtons);
                return ctx.wizard.next();
            }
        }
        catch (error) {
            yield ctx.reply("Error");
        }
    }
    const mainMessage = yield ctx.reply("Select scene that you want to enter", buttons_1.sceneButtons);
    ctx.wizard.state.mainMessageId = mainMessage.message_id;
    return ctx.wizard.next();
}), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
        return;
    }
    const fromMainSceneData = {
        mainMessageId: ctx.wizard.state.mainMessageId,
        fromStartingScene: true,
    };
    yield ctx.answerCbQuery();
    switch (ctx.callbackQuery.data) {
        case "create-product":
            return ctx.scene.enter("CREATE_PRODUCT", fromMainSceneData);
        case "create-combined-product":
            return ctx.scene.enter("CREATE_COMBINED_PRODUCT", fromMainSceneData);
        case "add-consumption":
            return ctx.scene.enter("ADD_CONSUMPTION", fromMainSceneData);
        case "add-custom-consumption":
            return ctx.scene.enter("ADD_CUSTOM_CONSUMPTION", fromMainSceneData);
        case "check-consumption-statistic":
            return ctx.scene.enter("CHECK_OR_DELETE_CONSUMPTION_STATISTIC", fromMainSceneData);
        case "best-protein-fiber":
            return ctx.scene.enter("PRODUCT_RAITING");
        case "set-or-check-goal":
            return ctx.scene.enter("SET_OR_CHECK_GOAL");
        case "leave":
            return ctx.scene.leave();
    }
}));
