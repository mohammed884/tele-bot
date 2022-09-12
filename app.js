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
mongoose.connect("mongodb://localhost:27017/ardunic-bot", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
bot.start(async ctx => {
    try {
        ctx.reply(`Hello There 
            \nYou can perform theses commands 
            \n/get to get the out of stock products
            \n/delete to delete the message by the product title
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
        const SECONDS = 1000 * 5;
        const products = await getOutOfStockProducts();
        ctx.reply(`Total (${products.length})`);
        let index = 0;
        const senderInterval = setInterval(async () => {
            const product = products[index]
            const reply = await ctx.reply(
                !product.emptyTypes
                    ?
                    product.title
                    :
                    `
                        ${product.title}
                        \n empty types 
                        ${product.emptyTypes} 
                    `

            );
            await ctx.replyWithPhoto(product.image, {
                reply_to_message_id: reply.message_id
            });
            await Product.create({
                title: product.title,
                messageId: reply.message_id,
            })
            index++;
            if (index > products.length) clearInterval(senderInterval)
        }, SECONDS);
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try again")
    }
});

bot.command("delete", async ctx => {
    try {
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
cron.schedule('1 0-23 * * *', async () => {
    try {
        const products = await getOutOfStockProducts();
        const SECONDS = 1000 * 20;
        bot.telegram.sendMessage(CHAT_ID, `Total ${products.length}`)
        let index = 0;
        const senderInterval = setInterval(async () => {
            const product = products[index]
            const reply = await bot.telegram.sendMessage(CHAT_ID,
                !product.emptyTypes
                    ?
                    product.title
                    :
                    `
                        ${product.title}
                        \n empty types 
                        ${product.emptyTypes} 
                    `
            );
            bot.telegram.sendPhoto(CHAT_ID, product.image, {
                reply_to_message_id: reply.message_id
            })
            await Product.create({
                title: product.title,
                messageId: reply.message_id,
            })
            index++;
            if (index > products.length) clearInterval(senderInterval)
        }, SECONDS);
        console.log("send a message");
    } catch (err) {
        console.log(err);
    }
});

bot.launch()
