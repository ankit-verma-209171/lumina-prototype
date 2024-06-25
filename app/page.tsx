"use client"

import Image from "next/image";
import { continueConversation, type Message } from "./ai/actions";
import { readStreamableValue } from "ai/rsc";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}:
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      <div>
        <input className="text-gray-900 bg-slate-50"
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            const { messages, newMessage } = await continueConversation([
              ...conversation,
              { role: "user", content: input },
            ]);

            let textContent = "";

            for await (const delta of readStreamableValue(newMessage)) {
              textContent = `${textContent}${delta}`;

              setConversation([
                ...messages,
                { role: "assistant", content: textContent },
              ]);
            }
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
