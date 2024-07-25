import {IProjectRef} from "@/models/ProjectRef";

export function getAiChatPrompt(files: string[], question: string, projectRef: IProjectRef): string {
    const content = files.join("\n");
    let summaries = ""
    projectRef.completeSummary.forEach((v, k) => {
        summaries += v + "\n"
    })

    return `
    You are an Expert Software Engineer.
    Understand the context of a codebase given below and give answer to the following question:
    QUESTION: ${question}
    
    CONTEXT (Content of relevent important files in a codebase for this question):
    For each file, the format should be
    ===
    <file-size> File: <file-name>
    Compact-Content:
    <content>
    End
    ===
    Here is the codebase:
    ${content}
    
    CONTEXT (Summary of all files in a codebase) should be in below format:
    For each file, the format should be
    ===
    <file-size> File: <file-name>
    Compact-Content:
    <summary>
    End
    ===
    Here is the codebase context:
    ${summaries}
    
    OUTPUT format should be like below:
    <answer in markdown>
    REFERENCES: 
    <list-of-referenced-files-full-paths-in-bullet-points>
    
    EXAMPLES:
    1) Which language is used in the project?
       Typescript (Assuming it is typescript project)
       
       REFERENCE:
       - index.tsx
    
    2) What are the core features of the project? (Assume it's an E-commerce project)
       The <project-name> has the following core features:
        - User Authentication using JWT
        - Allows user to browse products and see reviews
        - Allows user to buy different products via payment mechanism (Debit card, Credit card, ...)
        - Allow user to review their bought products
        - Fast delivery of products with some extra charges on the price
        
        REFERENCE:
        - auth/jwt.tsx
        - products/allProducts.tsx
        - product/buyProduct.tsx
        - product/sellProduct.tsx
        - product/ratings.tsx
        - product/delivery/instantDelivery.tsx
    
    3) Explain me the test written in sumTwoNumbers.kt (Assume there is a function called sumTwoNumbers which sums 2 numbers)
       FILE: math/testSumTwoNumbers.kt
       CONTENT:
       package math
       
       class TestSum {
            
            @Test
            fun testSumTwoNumbers() {
                assertEquals(sumTwoNumbers(1, 2), 3)
            }
       }
       
       EXPLANATION:
       The test function testSumTwoNumbers tests sumTwoNumbers function should return sum of 2 numbers
       It uses assertEquals to tests sumTwoNumbers(1, 2) returns 3 (the sum of the 1 and 2 as result or not)
       
       REFERENCES:
       - math/testSumTwoNumbers.kt
       - math/sumTwoNumbers.kt
       
    4) Write an onboarding guide for the project.
    <project-overview>
    <prerequisites>
    <getting-started>
    <running-project>
    <project-structure>
    <key-features>
    
    5) What architecture is used?
    <about-project-tech-stack>
    <about-project-architecture-depending-on-tech-stack-and-project-structure>
    
    6) Write code to add 2 numbers (Assuming project is in Kotlin)
    \`\`\`kotlin
    /**
     * Get sum of 2 numbers
     * 
     * @param a First number
     * @param b Second number
     * 
     * @returns The sum of a and b
     */
    fun add2Numbers(a: Int, b: Int) = a + b
    \`\`\`
    Explaination:
    This function takes 2 parametes a and b and returns the sum of a and b
    `
}