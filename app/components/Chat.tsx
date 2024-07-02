import React, { useEffect, useRef } from 'react'
import type { Message } from '../ai/actions'
import Markdown from 'react-markdown'
import Image from 'next/image'
import LuminaAvatarImage from '../images/lumina.jpg'

interface Props {
    conversation: Message[]
    className: string | undefined
}

function isUser(message: Message): boolean {
    return message.role == 'user'
}

function getChatClassNames(message: Message): string {
    if (isUser(message)) {
        return `chat-end`
    } else {
        return `chat-start`
    }
}

function getChatBubbleClassNames(message: Message): string {
    if (isUser(message)) {
        return `bg-primary text-primary-content`
    } else {
        return `bg-secondary text-secondary-content`
    }
}

const Chat: React.FC<Props> = ({ conversation, className = undefined }) => {
    const messageEndRef = useRef<null | HTMLDivElement>(null)

    useEffect(() => {
        messageEndRef.current?.scrollIntoView()
    }, [conversation])

    return (
        <div className={"overflow-scroll no-scrollbar" + " " + className} >
            {conversation.map((message, index) => (
                <div key={index} className={`chat ${getChatClassNames(message)}`}>
                    {(message.role !== 'user') && (<div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                            <Image
                                src={LuminaAvatarImage}
                                alt='avatar' />
                        </div>
                    </div>)
                    }
                    <Markdown className={`chat-bubble ${getChatBubbleClassNames(message)}`}>
                        {message.content}
                    </Markdown>
                </div>
            ))}

            <div ref={messageEndRef} />
        </div>
    )
}

export default Chat


