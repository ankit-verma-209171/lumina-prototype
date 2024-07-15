"use server";

import {google} from "@ai-sdk/google";
import {IProjectRef} from "@/app/models/ProjectRef";
import {createStreamableValue} from "ai/rsc";
import {generateText, streamText} from "ai";

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
 * @param projectRef
 * @returns conversation with forward talk
 */
export async function continueConversation(history: Message[], projectRef: IProjectRef | null) {
    "use server";

    const userMessage = history[history.length - 1]
    let updatedContent = userMessage.content

    if (projectRef !== null) {
        const filePaths: string[] = await getFilesFromAi(projectRef, userMessage.content)
        const files = filePaths.map(path => projectRef.completeContent.get(path) ?? `No content available for ${path}`)
        updatedContent = getPrompt(files, userMessage.content)
    }

    const updatedHistory: Message[] = [{role: "user", content: updatedContent}]

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

function getPrompt(files: string[], question: string): string {
    const content = files.join("\n");
    return `
    You are a Expert Software Engineer.
    Understand the context of a codebase given below and give answer to the following question:
    QUESTION: ${question}
    
    CONTEXT (Content of files in a codebase):
    For each file, the format should be
    ===
    <file-size> File: <file-name>
    Compact-Content:
    <content>
    End
    ===
    Here is the codebase:
    ${content}
    
    OUTPUT:
    <reply-to-question-in-markdown>
    `
}

async function getFilesFromAi(projectRef: IProjectRef, question: string): Promise<string[]> {
    let summaries = ""
    projectRef.completeSummary.forEach((v, k) => {
        summaries += v + "\n"
    })
    const filePrompt = `
          You are a Expert Software Engineer.
          Understand the context of a codebase given below and give answer to the following question:
          
          QUESTION:
          What are the most important files related to the question
          ${question}
          limit best match to 3 max files and explain why these files are important.
    
          OUTPUT Format should be strictly json object only in given below format and no markdown:
          {
             "files": [
                 "file1-name",
                 "file2-name",
                 "file3-name"
             ],
             reason: [
                 "reason1",
                 "reason2",
                 "reason3"
             ]
          }
          
          CONTEXT (summary of files in a codebase) should be in below format:
          For each file, the format should be
          ===
          <file-size> File: <file-name>
          Compact-Content:
          <summary>
          End
          ===
          Here is the codebase context:
          ${summaries}
        `
    const {text} = await generateText({
        model: google('models/gemini-1.5-flash-latest'),
        prompt: filePrompt,
    });

    console.log("OUTPUT:")
    console.log(text)
    const filteredJsonObject = text
        .replaceAll("```json", "")
        .replaceAll("```", "")
        .trim()
    console.log(filteredJsonObject)
    const fileResponse: File = JSON.parse(filteredJsonObject)
    return fileResponse.files
}

type File = {
    files: string[],
    reason: string[],
}