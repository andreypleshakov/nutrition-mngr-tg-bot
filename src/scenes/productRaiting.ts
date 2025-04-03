import { Scenes } from "telegraf";
import { IProductRaiting } from "../utils/models";
import { typeOfRaing } from "../utils/buttons";

export const productRaiting = new Scenes.WizardScene<Scenes.WizardContext>(
  "PRODUCT_RAITING",

  async (ctx: Scenes.WizardContext) => {
    // (ctx.wizard.state as IProductRaiting).tgId = ctx.from!.id;
    await ctx.reply(
      "Choose type of rating that you want to check",
      typeOfRaing
    );
  },

  async (ctx: Scenes.WizardContext) => {
    if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
      return;
    }

    const callBackData = ctx.callbackQuery.data;
    await ctx.answerCbQuery();

    switch (callBackData) {
      case "best-protein":
      // return ctx.scene.enter("CREATE_PRODUCT");
      case "best-fiber":
      // return ctx.scene.enter("CREATE_COMBINED_PRODUCT");
    }
  }
);
