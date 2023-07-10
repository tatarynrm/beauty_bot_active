const { Telegraf, Markup } = require("telegraf");
const categories = require("../categories/categories");
const cities = require("../cities/cities");

module.exports = {
  categoriesButtons: categories.map((item) => {
    console.log(item);
    return [{ text: item.text }];
  }),
  citiesButtons: cities.map((item) => {
    return [{ text: item.text }];
  }),
  workVariable: {
    reply_markup: {
      keyboard: [
        [{ text: `Робота на дому` }, { text: `Можливість виїзду до клієнта` }],
        [{ text: `Обидва варіанти` }],
        [{ text: `Салон краси / Студія` }],
      ],
      resize_keyboard: true,
    },
  },
  exitButton: {
    reply_markup: {
      keyboard: [[{ text: `Вийти` }]],
      resize_keyboard: true,
    },
  },

  masterButtons: {
    reply_markup: {
      keyboard: [[{ text: `✂ Я майстер` }, { text: `👩 Я клієнт` }]],
      resize_keyboard: true,
    },
  },
};
