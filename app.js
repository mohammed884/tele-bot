import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";
import getOutOfStockProducts from "./utilities/getOutOfStockProducts.js";
import createPdfFile from "./utilities/createPdfFile.js";
import cron from "node-cron";
import Product from "./models/Product.js";
import mongoose from "mongoose";
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const bot = new Telegraf(BOT_TOKEN);
mongoose.connect("mongodb://localhost:27017/ardunic-bot", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
bot.start(async ctx => {
    try {
        ctx.reply(`Hello There 
            \nYou can perform theses commands 
            \n/get to get the out of stock products
            \n/delete to delete the message by id
        `)
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try again")
    }
})
bot.help(ctx => {
    try {
        ctx.reply(`
            You can perform theses commands 
            \n /get
            \n /delete to delete the message by id
        `)
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try Again")
    }
});
bot.command("get", async ctx => {
    try {
        ctx.reply("Please Wait ...");
        const FIVE_SECONDS = 1000 * 5;
        const products = await getOutOfStockProducts();
        ctx.reply(`Total (${products.length})`);
        let index = 0;
        const senderInterval = setInterval(async () => {
            const product = products[index]
            const reply = await ctx.replyWithHTML(product.title);
            ctx.reply(`message id ${reply.message_id}`)
            await ctx.replyWithPhoto(product.image);
            await Product.create({
                title: product.title,
                message_id: reply.message_id,
            })
            index++;
            if (index > products.length) clearInterval(senderInterval)
        }, FIVE_SECONDS);
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try again")
    }
});

bot.command("delete", async ctx => {
    try {
        const messageId = Number(ctx.message.text.slice(8))
        await Product.deleteOne({ message_id: messageId })
        ctx.deleteMessage(messageId)
        ctx.deleteMessage(messageId + 1);
        ctx.deleteMessage(messageId + 2);
        ctx.deleteMessage(ctx.message.message_id);
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try again")
    }
});
cron.schedule('1 0-23 * * *', async () => {
    try {
        const products = await getOutOfStockProducts();
        const FIVE_SECONDS = 1000 * 5;
        bot.telegram.sendMessage(CHAT_ID, `Total ${products.length}`)
        let index = 0;
        const senderInterval = setInterval(async () => {
            const product = products[index]
            const reply = await bot.telegram.sendMessage(CHAT_ID, `Total (${products.length})`);
            bot.telegram.sendMessage(CHAT_ID,`message id ${reply.message_id}`)
            bot.telegram.sendPhoto(CHAT_ID,product.image)
            await Product.create({
                title: product.title,
                message_id: reply.message_id,
            })
            index++;
            if (index > products.length) clearInterval(senderInterval)
        }, FIVE_SECONDS);
        console.log("send a message");
    } catch (err) {
        console.log(err);
    }
});
bot.command("pdf_list", async ctx => {
    try {
        const products = await getOutOfStockProducts();
        const filename = createPdfFile(products);
        ctx.telegram.sendDocument(ctx.from.id, { filename });
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try again")
    }
})
bot.launch()
