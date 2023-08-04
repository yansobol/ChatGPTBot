import axios from "axios"
import Ffmpeg from "fluent-ffmpeg"
import installer from '@ffmpeg-installer/ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { removeFile } from "./utils.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        Ffmpeg.setFfmpegPath(installer.path)
    }
 
    async toMp3(input, output) {
        try {
            const outputPath = resolve(dirname(input), `${output}.mp3`)
            return new Promise((resolve, reject) => {
                Ffmpeg(input)
                .inputOption('-t 30')
                .output(outputPath)
                .on('end', () => {
                    removeFile(input)
                    resolve(outputPath)
                })
                .on('error', (error) => reject(error.message))
                .run()
            })
        } catch (error) {
            console.log('Error while converting ogg file to mp3: ', error.message)
        }
    }

    async create(url, filename) {
        try {
            const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream'
            })
            return new Promise(resolve => {
                const stream = createWriteStream(oggPath)
                response.data.pipe(stream)
                stream.on('finish', () => resolve(oggPath))
            })
        } catch (error) {
            console.log('Errro while downloading audio file: ', error.message)
        }
    }
}

export const oggConverter = new OggConverter()