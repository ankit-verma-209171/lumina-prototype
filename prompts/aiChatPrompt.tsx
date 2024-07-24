
export function getAiChatPrompt(files: string[], question: string): string {
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