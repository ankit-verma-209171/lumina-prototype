"use client"

import React, {useState} from 'react'
import Chat from '@/components/Chat'
import SendMessage from '@/components/SendMessage'
import type {Message} from '@/ai/actions'
import {ProjectRef} from "@/models/ProjectRef";

/**
 * Props for Lumina component
 *
 * @property projectRef Project Ref
 */
interface Props {
    projectRef: ProjectRef | null
}

/**
 * Lumina Ai is the Chat interface for the user to interact with AI
 *
 * @returns Lumina Ai component
 */
const LuminaAi: React.FC<Props> = ({projectRef}) => {
    // Conversation with the AI
    const [conversation, setConversation] = useState<Message[]>([])

    return (
        <div className="container flex h-screen flex-col mx-auto py-5 px-3 md:px-16 xl:px-64 gap-4">
            <Chat
                className="basis-11/12"
                conversation={conversation}/>

            <SendMessage
                projectRef={projectRef}
                conversation={conversation}
                setConversation={setConversation}
                className="flex items-center flex-row my-3 basis-1/12"/>
        </div>
    )
}

export default LuminaAi