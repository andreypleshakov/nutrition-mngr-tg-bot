import { Markup } from "telegraf";
import { ButtonType, IMeal, IProduct } from "./models";
import "dotenv/config";

const webAppUrl = process.env.WEB_APP_URL_TEST!;

export const sceneButtons = {
  reply_markup: {
    inline_keyboard: [
      // [{ text: "Open WebApp", web_app: { url: webAppUrl } }],
      [{ text: "Create product", callback_data: "create-product" }],
      [
        {
          text: "Create combined product",
          callback_data: "create-combined-product",
        },
      ],
      [
        {
          text: "Add consumption",
          callback_data: "add-consumption",
        },
      ],

      [
        {
          text: "Add custom consumption",
          callback_data: "add-custom-consumption",
        },
      ],
      [
        {
          text: "Check consumtion statistic",
          callback_data: "check-consumption-statistic",
        },
      ],
      // [
      //   {
      //     text: "Check best protein/fiber product",
      //     callback_data: "best-protein-fiber",
      //   },
      // ],
      // [
      //   {
      //     text: "Set or check goal",
      //     callback_data: "set-or-check-goal",
      //   },
      // ],
      // [
      //   {
      //     text: "Leave",
      //     callback_data: "leave",
      //   },
      // ],
    ],
  },
};

export const doneButton: ButtonType = {
  reply_markup: {
    inline_keyboard: [[{ text: "Done", callback_data: "bot-done" }]],
  },
};

export const createOrDoneButton = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Create", callback_data: "create" }],
      [{ text: "Done", callback_data: "bot-done" }],
    ],
  },
};

export const createButton = {
  reply_markup: {
    inline_keyboard: [[{ text: "Create", callback_data: "create" }]],
  },
};

export const yesOrNoButton = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "yes", callback_data: "bot-yes" },
        { text: "no", callback_data: "bot-no" },
      ],
    ],
  },
};

export const typeOfRaing = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Best protein source", callback_data: "best-protein" },
        { text: "Best fiber source", callback_data: "best-fiber" },
      ],
    ],
  },
};

export function getfixButtonProductBase(actualState: IProduct) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(`Name: ${actualState.name}`, "name")],
    [Markup.button.callback(`Kcal: ${actualState.kcal}`, "kcal")],
    [Markup.button.callback(`Protein: ${actualState.protein}`, "protein")],
    [
      Markup.button.callback(
        `Total fats: ${actualState.totalFat}`,
        "total-fat"
      ),
    ],
    [
      Markup.button.callback(
        `Saturated fats: ${actualState.saturatedFat}`,
        "saturated-fat"
      ),
    ],
    [
      Markup.button.callback(
        `Unsaturated fats: ${actualState.unsaturatedFat}`,
        "unsaturated-fat"
      ),
    ],
    [Markup.button.callback(`Carbohydrates: ${actualState.carbs}`, "carbs")],
    [Markup.button.callback(`Fiber: ${actualState.fiber}`, "fiber")],
    [Markup.button.callback("Done", "done")],
  ]);
}

export const perButton = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "100 gram", callback_data: "100-gram" },
        { text: "Custom mass (in gram)", callback_data: "custom-mass" },
      ],
    ],
  },
};

export const replaceAddOrIgnoreButton = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Replace", callback_data: "replace" }],
      [{ text: "Add", callback_data: "add" }],
      [{ text: "Ignore", callback_data: "ignore" }],
    ],
  },
};

export const todayOrCustomDateButton = [
  Markup.button.callback("Today", "today"),
  Markup.button.callback("Custom Date", "custom-date"),
];

export function getTypeOfStatisticButton() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "General daily statistic",
        "general-daily-statistic"
      ),
    ],
    [Markup.button.callback("List products", "list-of-consumed-products")],
    [Markup.button.callback("Delete product", "delete-consumed-product")],
  ]);
}

export function getFixButtonCombinedProduct(
  combinedProduct: IMeal
): ReturnType<typeof Markup.inlineKeyboard> {
  const buttons = Object.values(combinedProduct.products).map((product) => [
    Markup.button.callback(
      `${product.name}: ${product.mass}`,
      `${product._id}`
    ),
  ]);

  const doneButton = [Markup.button.callback("Done", "done_action")];

  buttons.push(doneButton);

  return Markup.inlineKeyboard(buttons);
}

export function getChooseProductButton(searchResults: any[]) {
  const inlineKeyboard = searchResults.map((product) => [
    { text: product.name, callback_data: product._id.toString() },
  ]);

  const chooseProductButton = {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  };

  return chooseProductButton;
}
export { ButtonType };

