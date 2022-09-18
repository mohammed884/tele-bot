import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";
import getOutOfStockProducts from "./utilities/getOutOfStockProducts.js";
import cron from "node-cron";
import Product from "./models/Product.js";
import mongoose from "mongoose";
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const bot = new Telegraf(BOT_TOKEN);
mongoose.connect("mongodb://127.0.0.1:27017/ardunic-bot", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

bot.start(async ctx => {
    try {
        if (ctx.chat.id !== Number(CHAT_ID)) return ctx.reply("Unauthorized")
        ctx.reply(`Hello There 
            \n/delete to delete the message by the product title
        `)
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try again")
    }
})
bot.help(ctx => {
    try {
        console.log(ctx.chat.id);
        ctx.reply(`
            \n/delete to delete the message by id
        `)
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try Again")
    }
});

bot.command("delete", async ctx => {
    try {
        if (ctx.chat.id !== Number(CHAT_ID)) return ctx.reply("Unauthorized")
        const title = ctx.message.text.slice(8)
        const product = await Product.findOne({ title });
        if (!product) return ctx.reply("There is no such product with that title")
        ctx.deleteMessage(product.messageId)
        ctx.deleteMessage(product.messageId + 1);
        ctx.deleteMessage(ctx.message.message_id);
        await product.delete();
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try to delete it again")
        ctx.deleteMessage(ctx.message.message_id);
    }
});
cron.schedule('0 */5 * * *', async () => {
    try {
        const products = await getOutOfStockProducts();
        const SECONDS = 1000 * 15;
        bot.telegram.sendMessage(Number(CHAT_ID), `Total ${products.length}`)
        let index = 0;
        const senderInterval = setInterval(async () => {
            if (index > products.length) return clearInterval(senderInterval)
            const product = products[index];
            const isDup = await Product.findOne({ title: product.title });
            if (!isDup) {
                const reply = await bot.telegram.sendMessage(Number(CHAT_ID),
                    !product.emptyTypes
                        ?
                        product.title
                        :
                        `
                            ${product.title}
                            \nempty types 
                            ${product.emptyTypes} 
                        `
                );
                bot.telegram.sendPhoto(Number(CHAT_ID), product.image, {
                    reply_to_message_id: reply.message_id
                })
                await Product.create({
                    title: product.title,
                    messageId: reply.message_id,
                })
            }
            index++;
        }, SECONDS);
    } catch (err) {
        console.log(err);
    }
});

bot.launch()
