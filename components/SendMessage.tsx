"use client"

import {readStreamableValue} from 'ai/rsc'
import React, {useState} from 'react'
import {continueConversation, type Message} from '@/ai/actions'
import {IoIosSend} from 'react-icons/io'
import {ProjectRef} from "@/models/ProjectRef";

/**
 * Represents Props for Send message component
 *
 * @property conversation Conversation with AI so far
 * @property setConversation Callback to add message to conversation
 * @property className Classes to add on the component
 */
interface Props {
    projectRef: ProjectRef | null,
    conversation: Message[]
    setConversation: (conversation: Message[]) => void
    className: string | undefined
}

/**
 * Handle prompt submission
 *
 * @param projectRef
 * @param conversation Conversation so far
 * @param input New message prompt
 * @param setConversation Add new message prompt to conversation
 * @param setInput Update input
 */
async function onPromptSubmit(
    projectRef: ProjectRef | null,
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
            {role: "user", content: input},
        ])

        // Get AI's response as stream
        const {messages, newMessage} = await continueConversation([
            ...conversation,
            {role: "user", content: input},
        ], projectRef?.json ?? null)

        // Update conversation with AI's response stream value
        let textContent = ""
        for await (const delta of readStreamableValue(newMessage)) {
            textContent = `${textContent}${delta}`

            setConversation([
                ...messages,
                {role: "assistant", content: textContent},
            ])
        }
    }
    await execute()
}

/**
 * Send Message component sends message to interact with AI
 *
 * @param param0 Props for send message component
 * @returns Send message component
 */
const SendMessage: React.FC<Props> = ({
                                          projectRef,
                                          conversation,
                                          setConversation,
                                          className = undefined
                                      }) => {
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
                onKeyDown={async (e) => {
                    // Handle enter press => submit prompt
                    if (e.key === "Enter") {
                        await onPromptSubmit(
                            projectRef,
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
                onClick={async () => {
                    await onPromptSubmit(
                        projectRef,
                        conversation,
                        input,
                        setConversation,
                        setInput
                    )
                }}
            >
                <IoIosSend size={25}/>
            </button>
        </div>
    )
}

export default SendMessage