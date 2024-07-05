"use client"

import { readStreamableValue } from 'ai/rsc'
import React, { useState } from 'react'
import { continueConversation, type Message } from '../ai/actions'
import { IoIosSend } from 'react-icons/io'

/**
 * Represents Props for Send message component
 * 
 * @property conversation Conversation with AI so far
 * @property setConversation Callback to add message to conversation
 * @property className Classes to add on the component
 */
interface Props {
    conversation: Message[]
    setConversation: (conversation: Message[]) => void
    className: string | undefined
}

/**
 * Handle prompt submission
 * 
 * @param conversation Conversation so far
 * @param input New message prompt
 * @param setConversation Add new message prompt to conversation
 * @param setInput Update input
 */
async function onPromptSubmit(
    conversation: Message[],
    input: string,
    setConversation: (conversation: Message[]) => void,
    setInput: React.Dispatch<React.SetStateAction<string>>,
) {
    const execute = async () => {
        // Reset input box
        setInput("")

        // Update conversation with new message
        setConversation([
            ...conversation,
            { role: "user", content: input },
        ])

        // Get AI's response as stream
        const { messages, newMessage } = await continueConversation([
            ...conversation,
            { role: "user", content: input },
        ])

        // Update conversation with AI's response stream value
        let textContent = ""
        for await (const delta of readStreamableValue(newMessage)) {
            textContent = `${textContent}${delta}`

            setConversation([
                ...messages,
                { role: "assistant", content: textContent },
            ])
        }
    }
    execute()
}

/**
 * Send Message component sends message to interact with AI
 * 
 * @param param0 Props for send message component
 * @returns Send message component
 */
const SendMessage: React.FC<Props> = ({ conversation, setConversation, className = undefined }) => {
    // User input
    const [input, setInput] = useState<string>("")

    return (
        <div className={className}>
            <input
                placeholder="Type here"
                className="input input-bordered flex-grow"
                type="text"
                value={input}
                onChange={(event) => {
                    setInput(event.target.value)
                }}
                onKeyDown={(e) => {
                    // Handle enter press => submit prompt
                    if (e.key === "Enter") {
                        onPromptSubmit(
                            conversation,
                            input,
                            setConversation,
                            setInput
                        )
                    }
                }}
            />

            <button
                className="btn btn-primary col-span-1 ms-3"
                onClick={() => onPromptSubmit(
                    conversation,
                    input,
                    setConversation,
                    setInput
                )}
            >
                <IoIosSend size={25} />
            </button>
        </div>
    )
}

export default SendMessage