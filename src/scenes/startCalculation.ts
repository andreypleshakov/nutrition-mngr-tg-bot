import { Scenes } from "telegraf";
import { IDialogueState, InitialState } from "../utils/models";
import {
  ConsumedProduct,
  PrimalProduct,
  User,
  UsersProduct,
} from "../utils/schemas";
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

          const newUser = new User(userData);
          await newUser.save();

          await PrimalProduct.updateMany(
            {},
            { $addToSet: { allowedUsersTgId: userId } }
          );

          await ctx.reply("Select scene that you want to enter", sceneButtons);
          return ctx.wizard.next();
        }
      } catch (error) {
        await ctx.reply("Error");
      }
    }

    const mainMessage = await ctx.reply(
      "Select scene that you want to enter",
      sceneButtons
    );
    (ctx.wizard.state as IDialogueState).mainMessageId = mainMessage.message_id;
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
      return;
    }

    const fromMainSceneData: InitialState = {
      mainMessageId: (ctx.wizard.state as IDialogueState).mainMessageId,
      fromStartingScene: true,
    };

    await ctx.answerCbQuery();

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
        return ctx.scene.enter(
          "CHECK_OR_DELETE_CONSUMPTION_STATISTIC",
          fromMainSceneData
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
