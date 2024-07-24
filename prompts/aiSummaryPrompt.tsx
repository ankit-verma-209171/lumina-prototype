import {TreeNode} from "@/models/manager.models";

export function getAiSummaryPrompt(
    size: string,
    file: TreeNode,
    data: string
): string {
    return `
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
       
        `
}