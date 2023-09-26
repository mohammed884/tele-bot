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
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/ardunic-bot-dev", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

bot.start(async ctx => {
    try {
        if (ctx.chat.id !== Number(CHAT_ID)) return ctx.reply("Unauthorized")
        ctx.reply(`Hello There 
            \n/ordered [product title] To Update the Product Status In The Database
            \n/delete [product title] To Delete The Message By The Product Title
            \n/cleardb To Clear The Database
            \n/clearchat To Clear The The Chat
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
        ctx.reply(`Hello There 
            \n/ordered [product title] To Update the Product Status In The Database
            \n/delete [product title] To Delete The Message By The Product Title
            \n/cleardb [product title] To Clear The Database
        `)
    } catch (err) {
        console.log(err);
        ctx.reply("Please Try Again")
    }
});
bot.command("ordered", async ctx => {
    try {
        if (ctx.chat.id !== Number(CHAT_ID)) return ctx.reply("Unauthorized")
        const title = ctx.message.text.slice(9)
        if (!title) return ctx.reply("Please provide a title");
        const product = await Product.findOne({ title });
        if (!product) return ctx.reply("There is no such product with that title");
        product.isOrdered = true;
        await product.save();
        ctx.reply("Product Updated Successfully");
    } catch (err) {
        ctx.reply("Please Try Again");
        console.log(err);
    }
})
bot.command("clearchat", async ctx => {
    try {
        const products = await Product.find({});
        products.forEach(async product => {
            await ctx.deleteMessage(product.messageId);
            await ctx.deleteMessage(product.messageId++);
            await product.delete()
        })
    } catch (err) {
        
    }
})
bot.command("cleardb", async ctx => {
    try {
        await Product.deleteMany({})
        ctx.reply("Database Deleted Successfully")
    } catch (err) {
        ctx.reply("Please Try Again")
        console.log(err);
    }
})
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
//'0 0 * * 0' , CRON JOB EVERY 7 DAYS
cron.schedule('0 0 * * 0', async () => {
    try {
        const products = await getOutOfStockProducts();
        const SECONDS = 1000 * 40;
        if (products.length < 1) return bot.telegram.sendMessage(Number(CHAT_ID), `Empty Stock Products are 0`)
        bot.telegram.sendMessage(Number(CHAT_ID), `Total ${products.length}`)
        let index = 0;
        const senderInterval = setInterval(async () => {
            if (index > products.length) return clearInterval(senderInterval)
            const product = products[index];
            const isDup = await Product.findOne({ title: product.title });
            if (isDup) return index++;
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
            await Product.create({title: product.title,messageId: reply.message_id})
            index++;
        }, SECONDS);
    } catch (err) {
        console.log(err);
    }
});

bot.launch()
