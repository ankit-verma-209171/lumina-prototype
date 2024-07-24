import React, {useEffect, useRef} from 'react'
import type {Message} from '@/ai/actions'
import Markdown from 'react-markdown'
import Image from 'next/image'
import LuminaAvatarImage from '@/images/lumina.jpg'

/**
 * Represents props for Chat component
 * 
 * @property conversation Conversation so far
 * @property className classes to add to the component
 */
interface Props {
    conversation: Message[]
    className: string | undefined
}

/**
 * Checks if given message is from user
 * 
 * @param message Message
 * @returns if the message was by user
 */
function isUser(message: Message): boolean {
    return message.role == 'user'
}

/**
 * Get chat classNames for the given message
 * 
 * @param message Message to add classes to
 * @returns List of classNames concated as string with spaces
 */
function getChatClassNames(message: Message): string {
    if (isUser(message)) {
        return `chat-end`
    } else {
        return `chat-start`
    }
}

/**
 * Get chat bubble classNames for a given message
 * 
 * @param message Message to add chat bubble classes
 * @returns List of classNames concated as string with spaces
 */
function getChatBubbleClassNames(message: Message): string {
    if (isUser(message)) {
        return `bg-primary text-primary-content`
    } else {
        return `bg-secondary text-secondary-content`
    }
}

/**
 * 
 * @param param0 Props for the component
 * @returns Chat component
 */
const Chat: React.FC<Props> = ({ conversation, className = undefined }) => {
    const messageEndRef = useRef<null | HTMLDivElement>(null)

    // Scrolls to bottom when new message is added
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
