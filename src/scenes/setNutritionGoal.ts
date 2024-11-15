import { Scenes } from "telegraf";

export const setNutritionGoal = new Scenes.WizardScene<Scenes.WizardContext>(
  "SET_NUTRITION_GOAL",

  async (ctx) => {
    await ctx.reply(
      "That is your nutrition goal, choose what do you want to change"
    );
  }
);
