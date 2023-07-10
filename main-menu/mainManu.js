const startMain = (bot) => {
  bot.start(async (ctx) => {
    const user = ctx.message.from;
    createIfNotExist(user);
    getUserRole(user).then((res) => {
      if (res.userRole === "user") {
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Привіт ${ctx.message.from.username}
    Бот салонів краси бла бла бла `,
          {
            reply_markup: {
              keyboard: [
                [{ text: `✂ Я майстер` }, { text: `👩 Я клієнт` }],
                //   [{ text: `Збір коштів на допомогу армії` }],
              ],
              resize_keyboard: true,
            },
          }
        );
      }
      ctx.replyWithHtml(
        ctx.chat.id,
        `Привіт ${ctx.message.from.username}
    Бот салонів краси бла бла бла `,
        {
          reply_markup: {
            keyboard: [
              [{ text: `✂ Я майстер` }, { text: `👩 Я клієнт` }],
              [{ text: `⚙ Особистий кабінет` }],
            ],
            resize_keyboard: true,
          },
        }
      );
    });
  });
};
module.exports = {
  startMain,
};
