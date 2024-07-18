"use server";

import {google} from "@ai-sdk/google";
import {IProjectRef} from "@/app/models/ProjectRef";
import {createStreamableValue} from "ai/rsc";
import {streamText} from "ai";
import {Ai} from "@/app/ai/ai";
import {TreeNode} from "@/app/models/manager.models";

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
        updatedContent = getPrompt(files, userMessage.content)
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
    
    OUTPUT format should be like below:
    <crisp answer in plain text or markdown>
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
    const text = await ai.generateContent({
        prompt: filePrompt
    })

    const filteredJsonObject = text
        .replaceAll("```json", "")
        .replaceAll("```", "")
        .trim()

    if (process.env.DEBUG === "yes") {
        console.log("OUTPUT:")
        console.log(text)
        console.log(filteredJsonObject)
    }
    const fileResponse: File = JSON.parse(filteredJsonObject)
    return fileResponse.files
}

type File = {
    files: string[],
    reason: string[],
}

export async function getAiSummary(size: string,
                                   file: TreeNode,
                                   data: string): Promise<string | null> {
    const text = await ai.generateContent({
        prompt: `
        You are a Expert Software Engineer.
        Give detailed summary with key points of each file of the codebase - min 3 and max 10 points per functions.
        Also preserve classes and method signatures in the summary as it is very important for you.
        
        OUTPUT should be in below format:
        For each file, the format should be
        \`\`\`
        ${file.sha} File: <file-name>
        Compact-Content:
        <file-summary>
        
        <method-signature> eg: function_name(argument) returns result_type
        <method-summary>
        End
        
        === EOF ===
        \`\`\`

        You will be given codebase in terms of formatted text file
        This formatted file will contain multiple files of the codebase in the specified format
        The format is 
        \`\`\`
        <file-size> File: <file-name>
        Content:
        <content-of-the-file>
        End

        \`\`\`

        Here is the codebase:
        ${size} File: ${file.path}
        Content:
        ${data}
        END
        
        `,
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