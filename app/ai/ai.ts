import {GoogleGenerativeAI} from "@google/generative-ai";

export class Ai {
    apiKeys: string[];
    currentApiKeyIndex: number = 0;

    constructor() {
        const apiKey1 = process.env.AI_API_KEY_1
        const apiKey2 = process.env.AI_API_KEY_2
        const apiKey3 = process.env.AI_API_KEY_3

        if (apiKey1 && apiKey2 && apiKey3) {
            this.apiKeys = [apiKey1, apiKey2, apiKey3];
        } else {
            throw new Error("No API key provided");
        }
    }

    getNextApiKey = (): string => {
        const index = this.currentApiKeyIndex++
        this.currentApiKeyIndex = this.currentApiKeyIndex % this.apiKeys.length
        return this.apiKeys[index]
    }

    generateContent = async ({prompt}: { prompt: string }): Promise<string> => {
        const genAI = new GoogleGenerativeAI(this.getNextApiKey());
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
        const result = await model.generateContent([prompt])
        const text = result.response.text()
        console.log("AI Response: $prompt $text")
        console.log(prompt)
        console.log("-----------")
        console.log(text)
        return text
    }
}
