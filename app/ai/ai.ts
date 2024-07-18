import {GenerateContentResult, GoogleGenerativeAI} from "@google/generative-ai";

export class Ai {
    apiKeys: string[];
    currentApiKeyIndex: number = 0;
    sharedApiKeyUsageCountArray: number[];
    maxRequestCount: number = 10

    constructor() {
        const apiKey1 = process.env.AI_API_KEY_1
        const apiKey2 = process.env.AI_API_KEY_2
        const apiKey3 = process.env.AI_API_KEY_3

        if (apiKey1 && apiKey2 && apiKey3) {
            this.apiKeys = [apiKey1, apiKey2, apiKey3];
            this.sharedApiKeyUsageCountArray = Array(this.apiKeys.length).fill(0);

            console.log("API KEYS set..." + this.apiKeys);

        } else {
            throw new Error("No API key provided");
        }
    }

    getNextApiKeyIndex = (): number => {
        this.currentApiKeyIndex = Math.floor(Math.random() * this.apiKeys.length)
        return this.currentApiKeyIndex
    }

    generateContent = async ({prompt}: { prompt: string }): Promise<string> => {
        let apiKeyIndex = this.getNextApiKeyIndex()

        console.log("New Request ")
        console.log("For API Index " + apiKeyIndex)

        while (this.sharedApiKeyUsageCountArray[apiKeyIndex] > this.maxRequestCount) {
            console.log("Failed hmm... waiting..." + apiKeyIndex)
            console.log("Count reached..." + this.sharedApiKeyUsageCountArray)
            await delay(1000)
            apiKeyIndex = this.getNextApiKeyIndex()
            console.log("Retrying... with new key" + apiKeyIndex)
        }

        this.sharedApiKeyUsageCountArray[apiKeyIndex] = incrementInRange(this.sharedApiKeyUsageCountArray[apiKeyIndex], this.maxRequestCount)
        console.log("Count state occupying..." + this.sharedApiKeyUsageCountArray)

        const apiKey = this.apiKeys[apiKeyIndex]
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"})
        let result: GenerateContentResult
        try {
            result = await model.generateContent([prompt])
        } catch (error) {
            await delay(1000)
            return this.generateContent({prompt: prompt})
        }
        const text = result.response.text()
        if (process.env.DEBUG === "yes") {
            console.log("AI Response: $prompt $text")
            console.log(prompt.slice(0, 100))
            console.log("-----------")
            console.log(text.slice(0, 100))
        }

        this.sharedApiKeyUsageCountArray[apiKeyIndex] = decrementInRange(this.sharedApiKeyUsageCountArray[apiKeyIndex], this.maxRequestCount)
        console.log("Count state after release..." + this.sharedApiKeyUsageCountArray)

        return text
    }
}

/**
 * Delays with ms milliseconds
 *
 * @param ms Milliseconds to delay
 * @returns Promise with delay timeout
 */
function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function incrementInRange(n: number, r: number): number {
    return (n + 1) % r
}

function decrementInRange(n: number, r: number): number {
    return (n + r - 1) % r
}