"use client"

import { readStreamableValue } from 'ai/rsc'
import React, { useState } from 'react'
import { continueConversation, type Message } from '../ai/actions'
import { IoIosSend } from 'react-icons/io'

interface Props {
    conversation: Message[]
    setConversation: (conversation: Message[]) => void
    className: string | undefined
}

const SendMessage: React.FC<Props> = ({ conversation, setConversation, className = undefined }) => {
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
            />

            <button
                className="btn btn-primary col-span-1 ms-3"
                onClick={async () => {
                    setInput("")

                    setConversation([
                        ...conversation,
                        { role: "user", content: input },
                    ])

                    const { messages, newMessage } = await continueConversation([
                        ...conversation,
                        { role: "user", content: input },
                    ])

                    let textContent = ""
                    for await (const delta of readStreamableValue(newMessage)) {
                        textContent = `${textContent}${delta}`

                        setConversation([
                            ...messages,
                            { role: "assistant", content: textContent },
                        ])
                    }
                }}
            >
                <IoIosSend size={25} />
            </button>
        </div>
    )
}

export default SendMessage