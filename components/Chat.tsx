import React, {useEffect, useRef} from 'react'
import type {Message} from '@/ai/actions'
import Markdown from 'react-markdown'
import Image from 'next/image'
import LuminaAvatarImage from '@/images/lumina.jpg'
import { IoPersonCircle } from 'react-icons/io5'

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
        return `border border-custom-gray`
    } else {
        return `bg-custom-gray mb-10`
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
        <div className={"overflow-scroll no-scrollbar px-3 flex align-items-end flex-col" + " " + className} >
            {conversation.map((message, index) => (
                <div key={index} className={`chat ${getChatClassNames(message)} my-3`}>
                    {(message.role !== 'user') && (<div className="avatar">
                        <div className="w-10 rounded-full">
                            <Image
                                src={LuminaAvatarImage}
                                alt='avatar' />
                        </div>
                    </div>)
                    }
                    <Markdown className={`pre leading-7 rounded-lg px-5 py-3 text-white ${getChatBubbleClassNames(message)}`}>
                        {message.content}
                    </Markdown>
                    {(message.role === 'user') && (
                        <div className="rounded-full">
                            <IoPersonCircle size={50} />
                        </div>
                    )}
                </div>
            ))}

            <div ref={messageEndRef} />
        </div>
    )
}

export default Chat
