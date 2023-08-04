import { Telegraf, session } from "telegraf";
import { message } from 'telegraf/filters'
import {code} from 'telegraf/format'
import config from 'config'
import dotenv from 'dotenv'
import { oggConverter } from './oggConverter.js'
import { cloudSpeechToText } from "./cloudSpeechToText.js";
import { openAi } from "./openAI.js";
import { removeFile } from "./utils.js"


let LANG_CODE = 'en-US'
const INITIAL_SESSION = {
    messages: []
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
bot.use(session())
bot.launch()
dotenv.config()

bot.command('new', async (ctx) => {
    ctx.session = JSON.parse(JSON.stringify(INITIAL_SESSION))
    await ctx.reply(code('Waiting for request...'))
})
bot.command('start', async (ctx) => {
    ctx.session = JSON.parse(JSON.stringify(INITIAL_SESSION))
    await ctx.reply(code('Waiting for request...'))
    console.log(ctx.session)

})

bot.command('eng', async (ctx) => {
    LANG_CODE = 'en-US'
    await ctx.reply(code('Language changed to English'))
})

bot.command('ru', async (ctx) => {
    LANG_CODE = 'ru-RU'
    await ctx.reply(code('Вы сменили язык на Русский'))

})
bot.command('hebrew', async (ctx) => {
    LANG_CODE = 'iw-IL'
    await ctx.reply(code('השפה הוחלפה לעברית'))
})

bot.on(message('text'), async ctx => {
    try {
        ctx.session ??= JSON.parse(JSON.stringify(INITIAL_SESSION))
        ctx.session.messages.push({
            role: openAi.roles.USER,
            content: ctx.message.text
        })
        const response = await openAi.chat(ctx.session.messages)
        await ctx.reply(response)
        ctx.session.messages.push({
            role: openAi.roles.ASSISTANT,
            content: response
        })
    } catch (error) {
        console.log(`Error while text message: ${error.message}`)
    }
})

bot.on(message('voice'), async ctx => {
    try {
        ctx.session ??= JSON.parse(JSON.stringify(INITIAL_SESSION))

        let transcription = ''
        const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const oggPath = await oggConverter.create(fileLink, userId)
        const mp3Path = await oggConverter.toMp3(oggPath, userId)

        if(LANG_CODE === 'iw-IL') {
            // Google Cloud Speech-to-Text transcription
            transcription = await cloudSpeechToText.voiceTranscription(mp3Path, 'MP3', LANG_CODE)
        } else {
            // OpenAI Speech-to-Text transcription
            transcription = await openAi.transcription(mp3Path)
        }
        removeFile(mp3Path)
        ctx.session.messages.push({
            role: openAi.roles.USER,
            content: transcription
        })
        await ctx.reply(transcription)
        const response = await openAi.chat(ctx.session.messages)
        await ctx.reply(response)
        ctx.session.messages.push({
            role: openAi.roles.ASSISTANT,
            content: response
        })
    } catch (error) {
        console.log('Error while voice message: ', error)
    }
})



process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM')) 