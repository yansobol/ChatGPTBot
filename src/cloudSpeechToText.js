// Imports the Google Cloud client library
import fs from 'fs'
import speech from '@google-cloud/speech'

class CloudSpeechToText {
    constructor() {
        this.client = new speech.SpeechClient();
    }

    async voiceTranscription (filename, encoding, languageCode, sampleRateHertz = '16000') {
        this.config = {
            encoding,
            sampleRateHertz,
            languageCode,
        };
        this.audio = {
            content: fs.readFileSync(filename).toString('base64'),
        };
        
        this.request = {
            config: this.config,
            audio: this.audio,
        };

        const [response] = await this.client.recognize(this.request);
        return response.results
         .map(result => result.alternatives[0].transcript)
         .join('\n');
    }     
}

export const cloudSpeechToText = new CloudSpeechToText()