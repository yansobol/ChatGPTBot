import { Configuration, OpenAIApi } from "openai"
import { createReadStream } from "fs"
import config from 'config'

class OpenAi {
    roles = {
        ASSISTANT: 'assistant',
        USER: 'user',
        SYSTEM: 'system'
    }
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey,
        })
        this.openai = new OpenAIApi(configuration)
    }

    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages
            })
            return response.data.choices[0].message.content
        } catch (error) {
            console.log(`Error while chat with ChatGPT: ${error.message}`)
        }
    } 

    async transcription(filePath) {
        try {
            const response = await this.openai.createTranscription(
                createReadStream(filePath),
                'whisper-1'
            )
            return response.data.text
        } catch (error) {
            console.log(`Error while audio transcription: ${error.message}`)
        }
    }
}

export const openAi = new OpenAi(config.get("OPENAI_API_KEY"))