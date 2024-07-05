"use server";

import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";

/**
 * Represents Message type for chat communication
 */
export interface Message {
    role: "user" | "assistant";
    content: string;
}

/**
 * Continue communication with AI via streaming protocol
 * 
 * @param history Previous conversation so far
 * @returns conversation with forward talk
 */
export async function continueConversation(history: Message[]) {
    "use server";

    const stream = createStreamableValue();
    const model = google("models/gemini-1.5-pro-latest");

    const start = console.time("prompt-response");
    (async () => {
        const { textStream } = await streamText({
            model: model,
            messages: history,
        });

        for await (const text of textStream) {
            stream.update(text);
        }

        stream.done();
    })().then(() => {
        console.timeEnd("prompt-response")
    });

    return {
        messages: history,
        newMessage: stream.value,
    };
}