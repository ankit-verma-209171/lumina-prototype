"use client"

import React, { useEffect, useRef, useState } from 'react'
import Chat from './Chat'
import SendMessage from './SendMessage'
import type { Message } from '../ai/actions'

const LuminaAi = () => {
    const [conversation, setConversation] = useState<Message[]>([])

    return (
        <div className="container flex h-screen flex-col mx-auto py-5">
            <Chat
                className="basis-11/12"
                conversation={conversation} />

            <SendMessage
                conversation={conversation}
                setConversation={setConversation}
                className="flex items-center flex-row my-3 basis-1/12" />
        </div>
    )
}

export default LuminaAi