import { Scenes } from "telegraf";
import { DialogueState } from "../utils/models";
import { userBase } from "../utils/schemas";
import { existanceOfUser } from "../utils/utils";
import { sceneButtons } from "../utils/buttons";

export const startCalculation = new Scenes.WizardScene<Scenes.WizardContext>(
  "START_CALCULATION",

  async (ctx) => {
    const userId = ctx.from!.id;
    const userName = ctx.from!.username!;

    const existance = await existanceOfUser(userId, userName);

    if (!existance) {
      const newUser = new userBase({ tgId: userId, tgUserName: userName });
      newUser.save();
    }

    await ctx.reply("Select scene that you want to enter", sceneButtons);
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
      return;
    }

    const fromStartingScene = { fromStartingScene: true } as DialogueState;
    const callBackData = ctx.callbackQuery.data;

    await ctx.answerCbQuery();

    switch (callBackData) {
      case "create-product":
        return ctx.scene.enter("CREATE_PRODUCT", fromStartingScene);
      case "create-combined-product":
        return ctx.scene.enter("CREATE_COMBINED_PRODUCT", fromStartingScene);
      case "add-consumption":
        return ctx.scene.enter("ADD_CONSUMPTION", fromStartingScene);
      case "check-consumption-statistic":
        return ctx.scene.enter(
          "CHECK_OR_DELETE_CONSUMPTION_STATISTIC",
          fromStartingScene
        );
      case "cost-of-protein":
        return ctx.scene.enter("COST_OF_PROTEIN");
      case "leave":
        return ctx.scene.leave();
    }
  }
);
