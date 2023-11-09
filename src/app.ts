import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'

const bot = new Telegraf('6664873036:AAE3Ljjm949wTHhXAecgo_zfeNX1i_y-f4A')
bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey bro'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))