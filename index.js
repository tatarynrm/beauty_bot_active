require("dotenv").config();
const { Telegraf, Scenes, Markup, session } = require("telegraf");
const bot = new Telegraf("5777519726:AAGtmIa9Gw4HBYok-YpqxTfogAyM8ZLaXLM");
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const fs = require("fs");
const axios = require("axios");
const needle = require("needle");
const path = require("path");

const {
  createIfNotExist,
  getList,
  getUserRole,
} = require("./services/userService");
const categories = require("./categories/categories");
const cities = require("./cities/cities");
const { categoriesButtons } = require("./buttons/buttons");
const { citiesButtons } = require("./buttons/buttons");

app.use(cors());

app.use("/scenes", express.static("scenes"));
const masterScene = require("./scenes/master");

const { remove } = require("./models/UserModel");
const { startMain } = require("./main-menu/mainManu");
mongoose
  .connect(
   "mongodb+srv://tatarynrm:Aa527465182@baby-shop.koyb4bl.mongodb.net/beauty?retryWrites=true&w=majority"
  )

  .then(() => console.log("DB is ok"))
  .catch((error) => console.log("Error", error));

const stage = new Scenes.Stage([masterScene]);
bot.use(session());
bot.use(stage.middleware());
bot.hears("✂ Я майстер", (ctx) => {
  ctx.scene.enter("masterWizard");
});
bot.hears("ВИЙТИ !!!", (ctx) => {
  ctx.scene.leave("masterWizard");
});

bot.start(async (ctx) => {
  const user = ctx.message.from;
  console.log(user);
  createIfNotExist(user);

  await bot.telegram.sendPhoto(ctx.chat.id, {
    source: "./photo/beautybot.jpg",
  });
  await bot.telegram.sendMessage(
    ctx.chat.id,
    `Привіт ${ctx.message.from.username}
🦋Ви довго думали який бізнес стане ідеальним саме для вас?\nІ ось нарешті вибір впав на сферу бьюті. Чудове рішення!\nПослуги пов'язані з красою не втрачають своєї популярності ні при ковіді, ні навіть під час воєнних дій.
Ваш статус: '👩 Я клієнт'.
У вас немає активних заявок.
Як тільки ви зареєструєтесь як \n'✂ Я майстер' - вашу анкету будуть бачити усі клієнти, які зареєстровані в системі.
`,
    {
      reply_markup: {
        keyboard: [
          [{ text: `✂ Я майстер` }, { text: `👩 Я клієнт` }],
          [{ text: `🤖 Зв'язок з розробником` }],
        ],
        resize_keyboard: true,
      },
    }
  );
});

const clientData = {
  userCity: "",
  userService: "",
};

bot.hears("👩 Я клієнт", async (ctx) => {
  const text = ctx.message.text;
  console.log(text);
  ctx.replyWithHTML("Оберіть категорію,яка вас цікавить", {
    reply_markup: {
      keyboard: categoriesButtons,
      resize_keyboard: true,
    },
  });
});
for (let i = 0; i < categories.length; i++) {
  const el = categories[i].text;
  bot.hears(el, (ctx) => {
    const text = ctx.message.text;
    clientData.userService = text;
    console.log(clientData);
    ctx.replyWithHTML("Оберіть місто", {
      reply_markup: {
        keyboard: citiesButtons,
        resize_keyboard: true,
      },
    });
  });
}
let dataData = [];
let start = 0;
let end = 3;
for (let i = 0; i < cities.length; i++) {
  const el = cities[i].text;
  bot.hears(el, async (ctx) => {
    const text = ctx.message.text;
    const user = ctx.message.from;
    clientData.userCity = text;

    getList(clientData).then((data) => {
      console.log(data);
      dataData.push(...data);
      if (data.length === 0) {
        // ctx.reply("За вашим запитом нажаль ще немає активних анкет.");
        ctx.replyWithHTML("За вашим запитом нажаль ще немає активних анкет.", {
          reply_markup: {
            keyboard: [[{ text: `✂ Я майстер` }, { text: `👩 Я клієнт` }]],
            resize_keyboard: true,
          },
        });
      }
      data.slice(start, end).map((item, i) => {
        setTimeout(() => {
          ctx.replyWithPhoto(
            {
              source: `./scenes/images/${item.userId}/${item.userId}.jpg`,
            },
            {
              caption: `📓${item.userFullName}\n 
\📲${item.userPhoneNumber}\n
📍${item.userCity}\n
✂️${item.userService}\n
🚘${item.userOfice}\n
📝${item.userDescription}
CHAT:@${item.userName}
    `,
            }
          );
        }, i * 1000);
      });
      ctx.replyWithHTML(`Знайдено анкет:  ${data.length - start}`, {
        reply_markup: {
          keyboard: [[{ text: `Завантажити ще` }]],
          resize_keyboard: true,
        },
      });
    });
  });
}

bot.hears("Завантажити ще", (ctx) => {
  console.log("start", start);
  console.log("end", end);
  dataData.slice(start + end, end + end).map((item) => {
    ctx.replyWithPhoto(
      {
        source: `./scenes/images/${item.userId}/${item.userId}.jpg`,
      },
      {
        caption: `📓${item.userFullName}\n 
\📲${item.userPhoneNumber}\n
📍${item.userCity}\n
✂️${item.userService}\n
🚘${item.userOfice}\n
📝${item.userDescription}
      `,
      }
    );
  });
  console.log(dataData.slice(start + end, end + end).length);
  if (dataData.slice(start + end, end + end).length < end) {
    ctx.reply("На даний момент,більше немає активних оголошень 👀", {
      reply_markup: {
        keyboard: [[{ text: `✂ Я майстер` }, { text: `👩 Я клієнт` }]],
        resize_keyboard: true,
      },
    });
  }
});

const screenKeyboard = Markup.inlineKeyboard([
  Markup.button.callback("Yes", "Yes"),
  Markup.button.callback("No", "No"),
]);
bot.command("/leaveScene", (ctx) => {
  // ctx.deleteMessage(ctx.update.message.message_id);

  ctx.reply("OK", screenKeyboard);

  bot.action("Yes", (ctx) => {
    // ctx.answerCbQuery("TАK BITCH", { cache_time: 7 });
    ctx.answerCbQuery();
    ctx.reply("You clicked yes Button");
  });
});

bot.hears(`🤖 Зв'язок з розробником`, (ctx) => {
  ctx.reply(
    "Напишіть свої побажання, щодо покращення , чи розширення функціоналу 🖐️ ",
    Markup.inlineKeyboard([
      Markup.button.callback("Написати розробнику", "all right"),
    ])
  );
});

// bot.action("more functions", (ctx) => {
//   ctx.editMessageText("Розробник --- @web_developer_Ukraine");
// });
bot.action("all right", (ctx) => {
  ctx.editMessageText("🤖 Розробник: @web_developer_Ukraine");
});
bot.on();
bot.launch();
app.listen(5005, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`Server Ok`);
});
// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
