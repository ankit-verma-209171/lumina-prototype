import Image from 'next/image'
import React, { useState } from 'react'
import GithubLogo from '../images/github.png'

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Step {
    name: string
    isCompleted: boolean
}

interface ProcessGithubLink {
    link: string,
    steps: Step[],
    setLinkReady: (isReady: boolean) => void,
    setSteps: (steps: Step[]) => void,
    onFinish: (isReady: boolean) => void,
}

async function processGithubLink({
    link, steps, setLinkReady, setSteps, onFinish
}: ProcessGithubLink) {
    console.log(link)
    setLinkReady(true)
    for (let i = 0; i < 4; ++i) {
        const newSteps = [...steps]
        newSteps[i].isCompleted = true
        await delay(1000)
        setSteps(newSteps)
    }
    onFinish(true)
}

interface Props {
    onFinish: (isReady: boolean) => void
}

const Onboarding: React.FC<Props> = ({ onFinish }) => {
    const [link, setLink] = useState<string>("")
    const [linkReady, setLinkReady] = useState<boolean>(false)
    const [steps, setSteps] = useState<Step[]>(
        [
            { name: "Analysing project", isCompleted: false },
            { name: "Indexing project", isCompleted: false },
            { name: "Summarizing project", isCompleted: false },
            { name: "Finishing setup", isCompleted: false },
        ]
    )

    return (
        <main className="flex flex-col justify-center items-center h-screen">
            <div className="flex flex-col w-full items-center">
                <div className="text-primary font-bold md:text-5xl text-3xl">Talk to Lumina</div>
                <label className="input input-bordered flex items-center gap-2 input-primary md:w-7/12 w-11/12 mt-5">
                    <Image
                        className="size-7"
                        src={GithubLogo}
                        alt='github-logo'
                    />
                    <input
                        placeholder=" Project Github Link"
                        value={link}
                        type="text"
                        className="text-center w-full"
                        onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                                await processGithubLink({
                                    link: link,
                                    steps: steps,
                                    setLinkReady: (isReady) => setLinkReady(isReady),
                                    setSteps: (steps) => setSteps(steps),
                                    onFinish: (isReady) => onFinish(isReady)
                                })
                            }
                        }}
                        onChange={(event) => {
                            setLink(event.target.value)
                        }}
                    />
                </label>
            </div>
            {
                linkReady &&
                (<div className="flex flex-col min-w-9 items-start">
                    {
                        steps.map(step => (
                            <label key={step.name} className="flex cursor-pointer mt-5">
                                <input type="checkbox" checked={step.isCompleted} readOnly className="checkbox checkbox-primary me-3" />
                                <span className="text-start">{step.name}</span>
                            </label>
                        ))
                    }
                </div>)
            }
        </main>
    )
}

export default Onboarding