export function getAiFilePrompt(
    question: string,
    summaries: string
): string {
    const prompt = `
          You are an Expert Software Engineer.
          Understand the context of a codebase given below and give answer to the following question:
          
          QUESTION:
          What are the most important files related to the question
          ${question}
          limit best match to 5 max files and explain why these files are important.
    
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

    return prompt
}