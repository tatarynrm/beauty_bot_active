const { Telegraf, Markup, Composer, Scenes } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);
const {
  exitButton,
  citiesButtons,
  categoriesButtons,
  workVariable,
  masterButtons,
} = require("../buttons/buttons");
const { getUserRole } = require("../services/userService");
const { startMain } = require("../main-menu/mainManu");
const { masterCreate } = require("../services/userService");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const yesUndefined = (name) => (typeof name === "undefined" ? "" : name);
const categories = require("../categories/categories");

const startStep = new Composer();
startStep.on("text", async (ctx) => {
  try {
    ctx.wizard.state.data = {};
    ctx.wizard.state.data.userName = ctx.message.from.username;
    ctx.wizard.state.data.firstName = ctx.message.from.first_name;
    ctx.wizard.state.data.lastName = ctx.message.from.last_name;
    await ctx.replyWithHTML("Заповніть вашу заявку", exitButton);
    await ctx.replyWithHTML(
      `<b>Вкажіть ваше прізвище та ім'я:</b>
<i>Наприклад: Юлія,Роман </i>`
    );
    return ctx.wizard.next();
  } catch (er) {
    console.log(er);
  }
});

const nameStep = new Composer();
nameStep.on("text", async (ctx) => {
  try {
    ctx.wizard.state.data.value1 = ctx.message.text;
    await ctx.replyWithHTML(
      `<b>Вкажіть ваш номер телефону:</b>
<i>У форматі: +380ХХХХХХХ </i>`,
      exitButton
    );
    return ctx.wizard.next();
  } catch (er) {
    console.log(er);
  }
});
const cityStep = new Composer();
cityStep.on("text", async (ctx) => {
  try {
    ctx.wizard.state.data.value2 = ctx.message.text;
    await ctx.replyWithHTML(`<b>Оберіть ваше місто:</b>`, {
      reply_markup: {
        keyboard: citiesButtons,
        resize_keyboard: true,
      },
    });
    return ctx.wizard.next();
  } catch (er) {
    console.log(er);
  }
});
const categoryStep = new Composer();
categoryStep.on("text", async (ctx) => {
  try {
    ctx.wizard.state.data.value3 = ctx.message.text;
    await ctx.replyWithHTML(`<b>Оберіть вид ваших послуг:</b>`, {
      reply_markup: {
        keyboard: categoriesButtons,
        resize_keyboard: true,
      },
    });

    return ctx.wizard.next();
  } catch (er) {
    console.log(er);
  }
});
const prePhotoStep = new Composer();
prePhotoStep.on("text", async (ctx) => {
  try {
    ctx.wizard.state.data.value4 = ctx.message.text;
    await ctx.replyWithHTML(
      `<b>Завантажте лише ОДНЕ☝️ 1 ☝️ фото:</b>
<i>Якщо ви звантажите 2 або більше фото,бот зупинить свою роботу і вам необдхідно перезавантажити бота.\nКоманда /start \nЗавантажуйте лише 1 фото
Це може бути ваш логотип, фото вашої студії, або ж ваше особисте фото.</i>`,
      exitButton
    );

    return ctx.wizard.next();
  } catch (er) {
    console.log(er);
  }
});

const photoStep = new Composer();
photoStep.on("message", async (ctx) => {
  try {
    if (!ctx.update.message.photo) {
      ctx.reply("Завантажуйте лише ФОТО у форматі .jpeg / .png ");
      return prePhotoStep.on("text", async (ctx) => {
        try {
          ctx.wizard.state.data.lol = ctx.message.text;
          await ctx.replyWithHTML(`<b>Завантажте фото:</b>`);
        } catch (er) {
          console.log(er);
        }
      });
    }
    ctx.reply("Де ви працюєте ?", workVariable);
    // ctx.wizard.state.data.value5 = ctx.message.text; -- фотка
    ctx.wizard.state.data.value5 = `http://localhost:5005/scenes/images/${ctx.update.message.from.id}/${ctx.update.message.from.id}.jpg`;

    const fileId = ctx.update.message.photo.pop().file_id;
    // const fileId = ctx.update.message.photo.file_id;
    const dir = `${__dirname}/images/${ctx.update.message.from.id}`;
    ctx.telegram.getFileLink(fileId).then((url) => {
      axios({ url, responseType: "stream" }).then((response) => {
        return new Promise((resolve, reject) => {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          response.data
            .pipe(
              fs.createWriteStream(`${dir}/${ctx.update.message.from.id}.jpg`)
            )
            .on("finish", () => console.log(this))
            .on("error", (e) => console.log(e));
        });
      });
    });

    ctx.wizard.next();
  } catch (er) {
    console.log(er);
  }
});

const descriptionStep = new Composer();
descriptionStep.on("text", async (ctx) => {
  const user = ctx.message.from;
  try {
    ctx.wizard.state.data.value6 = ctx.message.text;
    const wizardData = ctx.wizard.state.data;
    await ctx.replyWithHTML(
      `<b>Розкажіть детальніше,чим саме ви займаєтесь.\nЦі дані будуть відображатись у вашій анкеті: </b>\n <b>Довільний текст</b>
<i>Наприклад: Займаюсь жіночими та чоловічими стрижками і т.д</i>      
`,
      exitButton
    );
    ctx.wizard.next();
  } catch (er) {
    console.log(er);
  }
});

const conditionStep = new Composer();
conditionStep.on("text", async (ctx) => {
  const user = ctx.message.from;
  try {
    ctx.wizard.state.data.value7 = ctx.message.text;
    const wizardData = ctx.wizard.state.data;
    // await ctx.replyWithHTML(`<b>${wizardData.title}</b> \n${wizardData.city}`);
    await ctx.replyWithPhoto({ url: `${wizardData.value5}` });
    await ctx.replyWithHTML(
      `<b>📓${wizardData.value1}</b>\n📲${wizardData.value2}\n📍${wizardData.value3}\n✂️${wizardData.value4}\n🚘${wizardData.value6}\n📝${wizardData.value7}`
    );
    wizardData.role = "master";
    masterCreate(user, wizardData);
    await ctx.replyWithHTML(
      `<b>Ваша анкета заповнена!
Після модерації,-анкета буде доступна для показу клієнтам.</b>`
    );
    await ctx.reply("Головне меню", masterButtons);
    return ctx.scene.leave();
  } catch (er) {
    console.log(er);
  }
});

const masterScene = new Scenes.WizardScene(
  "masterWizard",
  startStep,
  nameStep,
  cityStep,
  categoryStep,
  prePhotoStep,
  photoStep,
  descriptionStep,
  conditionStep
);

masterScene.hears("Вийти", (ctx) => {
  ctx.scene.leave();
  const user = ctx.message.from;
  ctx.replyWithHTML("Головне меню:", {
    reply_markup: {
      keyboard: [[{ text: `✂ Я майстер` }, { text: `👩 Я клієнт` }]],
      resize_keyboard: true,
    },
  });
});
module.exports = masterScene;
