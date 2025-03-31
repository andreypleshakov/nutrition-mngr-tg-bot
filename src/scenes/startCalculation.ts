import { Scenes } from "telegraf";
import { DialogueState } from "../utils/models";
import { userBase } from "../utils/schemas";
import { existanceOfUser } from "../utils/utils";
import { sceneButtons } from "../utils/buttons";

export const startCalculation = new Scenes.WizardScene<Scenes.WizardContext>(
  "START_CALCULATION",

  async (ctx) => {
    if (ctx.from) {
      const { id: userId, username: userName } = ctx.from;

      try {
        const existance = await existanceOfUser(userId);

        if (!existance) {
          const userData = {
            tgId: userId,
            ...(userName && { tgUserName: userName }),
          };

          const newUser = new userBase(userData);
          await newUser.save();
          await ctx.reply("Select scene that you want to enter", sceneButtons);
          return ctx.wizard.next();
        }
      } catch (error) {
        await ctx.reply("Error");
      }
    }

    const sM = await ctx.reply(
      "Select scene that you want to enter",
      sceneButtons
    );
    console.log("1", sM.message_id);
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
      case "add-custom-consumption":
        return ctx.scene.enter("ADD_CUSTOM_CONSUMPTION", fromStartingScene);
      case "check-consumption-statistic":
        return ctx.scene.enter(
          "CHECK_OR_DELETE_CONSUMPTION_STATISTIC",
          fromStartingScene
        );
      case "best-protein-fiber":
        return ctx.scene.enter("PRODUCT_RAITING");
      case "set-or-check-goal":
        return ctx.scene.enter("SET_OR_CHECK_GOAL");
      case "leave":
        return ctx.scene.leave();
    }
  }
);
