import React from 'react'
import type { Message } from '../ai/actions'
import ReactMarkdown from 'react-markdown'
import Markdown from 'react-markdown'
import Image from 'next/image'
import LuminaAvatarImage from '../images/lumina.jpg'

interface Props {
    conversation: Message[]
    className: string | undefined
}

const Chat: React.FC<Props> = ({ conversation, className = undefined }) => {
    return (
        <div className={"overflow-scroll" + " " + className} >
            {conversation.map((message, index) => (
                <div key={index} className={`chat chat-${message.role === 'user' ? 'end' : 'start'}`}>
                    {
                        (message.role !== 'user') &&
                        <div className="chat-image avatar">
                            <div className="w-10 rounded-full">
                                <Image
                                    src={LuminaAvatarImage}
                                    alt='avatar' />
                            </div>
                        </div>
                    }

                    <Markdown className="chat-bubble">
                        {message.content}
                    </Markdown>
                </div>
            ))}
        </div>
    )
}

export default Chat


