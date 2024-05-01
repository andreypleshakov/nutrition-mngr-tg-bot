import { Markup } from "telegraf";

import { CombinedProduct } from "./models";

export const doneButton = {
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

export const fixButtonProductBase = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "Name", callback_data: "name" }],
      [{ text: "Calories", callback_data: "kcal" }],
      [{ text: "Proteins", callback_data: "protein" }],
      [{ text: "Total fats", callback_data: "total-fat" }],
      [{ text: "Saturated fats", callback_data: "saturated-fat" }],
      [{ text: "Unsaturated fats", callback_data: "unsaturated-fat" }],
      [{ text: "Carbohydrates", callback_data: "carbs" }],
    ],
  },
};

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

export const sceneButtons = {
  reply_markup: {
    inline_keyboard: [
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
          text: "Check consumtion statistic",
          callback_data: "check-consumption-statistic",
        },
      ],

      [
        {
          text: "Cost of one gram protein in product",
          callback_data: "cost-of-protein",
        },
      ],

      [
        {
          text: "Leave",
          callback_data: "leave",
        },
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

export function getTypeOfStatisticButton(): ReturnType<
  typeof Markup.inlineKeyboard
> {
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

export function isCreateButton(ctx: any): boolean {
  if (ctx.callbackQuery !== undefined && ctx.callbackQuery.data === "create") {
    return true;
  }
  return false;
}

export function getFixButtonCombinedProduct(
  combinedProduct: CombinedProduct
): ReturnType<typeof Markup.inlineKeyboard> {
  const buttons = Object.values(combinedProduct.products).map((product) =>
    Markup.button.callback(`${product.name}: ${product.mass}`, `${product._id}`)
  );

  return Markup.inlineKeyboard(buttons);
}

export function getYesOrNoButton(ctx: any): boolean {
  if (
    ctx.callbackQuery !== undefined &&
    (ctx.callbackQuery as any).data === "bot-yes"
  ) {
    return true;
  }
  return false;
}

export function isDoneButton(ctx: any): boolean {
  if (
    ctx.callbackQuery !== undefined &&
    (ctx.callbackQuery as any).data === "bot-done"
  ) {
    return true;
  }
  return false;
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
