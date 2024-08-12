"use server";

import {google} from "@ai-sdk/google";
import {IProjectRef} from "@/models/ProjectRef";
import {createStreamableValue} from "ai/rsc";
import {streamText} from "ai";
import {Ai} from "@/ai/ai";
import {TreeNode} from "@/models/manager.models";
import {getAiSummaryPrompt} from "@/prompts/aiSummaryPrompt";
import {getAiFilePrompt} from "@/prompts/aiFilePrompt";
import {getAiChatPrompt} from "@/prompts/aiChatPrompt";

/**
 * Represents Message type for chat communication
 */
export interface Message {
    role: "user" | "assistant";
    content: string;
}

const ai = new Ai()

/**
 * Continue communication with AI via streaming protocol
 *
 * @param history Previous conversation so far
 * @param projectRef
 * @returns conversation with forward talk
 */
export async function continueConversation(history: Message[], projectRef: IProjectRef | null) {
    "use server";

    const userMessage = history[history.length - 1]
    let updatedContent = userMessage.content
    if (process.env.DEBUG === "yes") {
        console.log("userMessage", userMessage)
    }

    if (projectRef !== null) {
        const filePaths: string[] = await getFilesFromAi(projectRef, userMessage.content)
        const files = filePaths.map(path => projectRef.completeContent.get(path) ?? `No content available for ${path}`)
        updatedContent = getAiChatPrompt(files, userMessage.content, projectRef)
    }
    if (process.env.DEBUG === "yes") {
        console.log("updated Content", updatedContent)
    }

    const recentHistory = history.slice(Math.max(history.length - 5, 0))
    const updatedHistory: Message[] = [
        {
            role: "user",
            content: `User's messages have role of user and your messages will have a role assistant`
        },
        ...recentHistory,
        {
            role: "user",
            content: updatedContent
        }
    ]

    const stream = createStreamableValue();
    const model = google("models/gemini-1.5-flash-latest");

    console.time("prompt-response");
    (async () => {
        const {textStream} = await streamText({
            model: model,
            messages: updatedHistory,
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


async function getFilesFromAi(projectRef: IProjectRef, question: string): Promise<string[]> {
    let summaries = ""
    projectRef.completeSummary.forEach((v, k) => {
        summaries += v + "\n"
    })
    const filePrompt = getAiFilePrompt(question, summaries)
    const text = await ai.generateContent({
        prompt: filePrompt
    })

    if (text === null) {
        return []
    }

    const responseJson = text.replaceAll("```json", "")
        .replaceAll("```", "")
        .replaceAll("`", "\`")
        .trim()

    if (process.env.DEBUG === "yes") {
        console.log("OUTPUT:")
        console.log(text)
        console.log(responseJson)
    }
    try {
        const fileResponse = JSON.parse(responseJson)
        return fileResponse.files
    }
    catch (e) {
        console.log("=========================")
        console.log(responseJson)
        console.error(e)
        console.log("=========================")
        return []
    }
}

type File = {
    files: string[],
    reason: string[],
}

export async function getAiSummary(size: string,
                                   file: TreeNode,
                                   data: string): Promise<string | null> {
    const text = await ai.generateContent({
        prompt: getAiSummaryPrompt(size, file, data)
    })

    if (process.env.DEBUG === "yes") {
        console.log(`
        PROMPT: ${file.url}
        RESPONSE:
        ${text}
        `)
    }

    return text
}