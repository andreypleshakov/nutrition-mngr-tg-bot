import { Scenes } from "telegraf";
import {
  yesAndNoButton,
  yesOrNoButton,
  getDailyStatistic,
} from "../utils/utils";
import { DialogueState } from "../utils/models";

///////////// check today's consumption (take data form daily_statistics)
export const checkTodayConsumption =
  new Scenes.WizardScene<Scenes.WizardContext>(
    "CHECK_TODAY_CONSUMPTION",

    //STEP 0: Give all requested information from daily_statistics
    async (ctx) => {
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const year = today.getFullYear();
      const todayDate = `${day}.${month}.${year}`;

      const checkDate = await getDailyStatistic(todayDate);
      if (checkDate === null) {
        await ctx.reply(`You did not eat anything today(${todayDate})`);
        await ctx.reply(
          "Do you want to fill your daily consumption? (you will be sent to fill daily statistic)",
          yesAndNoButton
        );
        return ctx.wizard.next();
      }

      const productInfo = `
        Date of consumption: ${checkDate.dateOfDaily}
        Calories: ${checkDate.kcal}
        Proteins(g): ${checkDate.protein}
        Total Fat(g): ${checkDate.totalFat}
        Carbohydrates(g): ${checkDate.carbs}
        -------------------
        Proteins(%): ${checkDate.proteinPercent}
        Total Fat(%): ${checkDate.totalFatPercent}
        Carbohydrates(%): ${checkDate.carbPercent}
        -------------------
        Saturated fats(%): ${checkDate.satFatPercent}
        Unsaturated fats(%): ${checkDate.unsatFatPercent}`;

      await ctx.reply(productInfo);
      return ctx.scene.leave();
    },

    //STEP 1: Waiting for "yes"/"no" answer and finishing scene
    async (ctx) => {
      const success = yesOrNoButton(ctx);
      await ctx.answerCbQuery(undefined);
      if (success) {
        let initalState = {} as DialogueState;
        ctx.scene.enter("ADD_TODAY_FOOD_TO_BASE", initalState);
        return;
      }
      await ctx.reply(
        "You can't check statistics of today consumption because you didn't fill todays daily statistic"
      );
      await ctx.reply(
        "Use command /add_daily_product to calculate your consumption"
      );
      return ctx.scene.leave();
    }
  );
