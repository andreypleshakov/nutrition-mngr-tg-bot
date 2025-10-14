"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rangeTypeButtons = exports.todayOrCustomDateButton = exports.replaceAddOrIgnoreButton = exports.perButton = exports.typeOfRaing = exports.yesOrNoButton = exports.createButton = exports.createOrDoneButton = exports.doneButton = exports.sceneButtons = void 0;
exports.getfixButtonProductBase = getfixButtonProductBase;
exports.getTypeOfStatisticButton = getTypeOfStatisticButton;
exports.getFixButtonCombinedProduct = getFixButtonCombinedProduct;
exports.getChooseProductButton = getChooseProductButton;
const telegraf_1 = require("telegraf");
require("dotenv/config");
const webAppUrl = process.env.WEB_APP_URL_TEST;
exports.sceneButtons = {
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
exports.doneButton = {
    reply_markup: {
        inline_keyboard: [[{ text: "Done", callback_data: "bot-done" }]],
    },
};
exports.createOrDoneButton = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "Create", callback_data: "create" }],
            [{ text: "Done", callback_data: "bot-done" }],
        ],
    },
};
exports.createButton = {
    reply_markup: {
        inline_keyboard: [[{ text: "Create", callback_data: "create" }]],
    },
};
exports.yesOrNoButton = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: "yes", callback_data: "bot-yes" },
                { text: "no", callback_data: "bot-no" },
            ],
        ],
    },
};
exports.typeOfRaing = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: "Best protein source", callback_data: "best-protein" },
                { text: "Best fiber source", callback_data: "best-fiber" },
            ],
        ],
    },
};
function getfixButtonProductBase(actualState) {
    return telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback(`Name: ${actualState.name}`, "name")],
        [telegraf_1.Markup.button.callback(`Kcal: ${actualState.kcal}`, "kcal")],
        [telegraf_1.Markup.button.callback(`Protein: ${actualState.protein}`, "protein")],
        [
            telegraf_1.Markup.button.callback(`Total fats: ${actualState.totalFat}`, "total-fat"),
        ],
        [
            telegraf_1.Markup.button.callback(`Saturated fats: ${actualState.saturatedFat}`, "saturated-fat"),
        ],
        [
            telegraf_1.Markup.button.callback(`Unsaturated fats: ${actualState.unsaturatedFat}`, "unsaturated-fat"),
        ],
        [telegraf_1.Markup.button.callback(`Carbohydrates: ${actualState.carbs}`, "carbs")],
        [telegraf_1.Markup.button.callback(`Fiber: ${actualState.fiber}`, "fiber")],
        [telegraf_1.Markup.button.callback("Done", "done")],
    ]);
}
exports.perButton = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: "100 gram", callback_data: "100-gram" },
                { text: "Custom mass (in gram)", callback_data: "custom-mass" },
            ],
        ],
    },
};
exports.replaceAddOrIgnoreButton = {
    reply_markup: {
        inline_keyboard: [
            [{ text: "Replace", callback_data: "replace" }],
            [{ text: "Add", callback_data: "add" }],
            [{ text: "Ignore", callback_data: "ignore" }],
        ],
    },
};
exports.todayOrCustomDateButton = [
    [telegraf_1.Markup.button.callback("Today", "today")],
    [telegraf_1.Markup.button.callback("Yesterday", "yesterday")],
    [telegraf_1.Markup.button.callback("Custom Date", "custom-date")],
    [telegraf_1.Markup.button.callback("Date Range", "date-range")],
];
exports.rangeTypeButtons = [
    [telegraf_1.Markup.button.callback("Custom Range", "custom-range")],
    [telegraf_1.Markup.button.callback("Week Range", "week-range")],
    [telegraf_1.Markup.button.callback("Month Range", "month-range")],
];
function getTypeOfStatisticButton(isDateRange = false) {
    const buttons = [
        [
            telegraf_1.Markup.button.callback("General daily statistic", "general-daily-statistic"),
        ],
    ];
    if (isDateRange) {
        buttons.push([
            telegraf_1.Markup.button.callback("Average daily statistic", "average-daily-statistic"),
        ]);
    }
    buttons.push([telegraf_1.Markup.button.callback("List products", "list-of-consumed-products")], [telegraf_1.Markup.button.callback("Delete product", "delete-consumed-product")]);
    return telegraf_1.Markup.inlineKeyboard(buttons);
}
function getFixButtonCombinedProduct(combinedProduct) {
    const buttons = Object.values(combinedProduct.products).map((product) => [
        telegraf_1.Markup.button.callback(`${product.name}: ${product.mass}`, `${product._id}`),
    ]);
    const doneButton = [telegraf_1.Markup.button.callback("Done", "done_action")];
    buttons.push(doneButton);
    return telegraf_1.Markup.inlineKeyboard(buttons);
}
function getChooseProductButton(searchResults) {
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
