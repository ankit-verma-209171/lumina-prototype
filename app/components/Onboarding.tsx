"use client";

import Image from 'next/image'
import React, { useState } from 'react'
import GithubLogo from '../images/github.png'
import { getGithubRepoInfo } from '../manager/gitmanager';

const threshHoldRepoSize = 4 * 1024 // 4 MB

/**
 * Delays with ms milliseconds
 * 
 * @param ms Milliseconds to delay
 * @returns Promise with delay timeout
 */
function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Represents initialization and processing step interface
 * 
 * @property name Name of the step
 * @property isCompleted Whether the step is completed or not
 */
interface Step {
    name: string
    isCompleted: boolean
}

/**
 * Represents github link processing
 * 
 * @property link Link for github repo
 * @property steps Steps for initialization & processing
 * @property setLinkReady Update if link is ready for processing
 * @property setSteps Update the step completion state
 * @property onFinish Callback when finished with the process or aborted
 */
interface ProcessGithubLink {
    link: string,
    steps: Step[],
    setLinkReady: (isReady: boolean) => void,
    setSteps: (steps: Step[]) => void,
    onFinish: (isReady: boolean) => void,
}

/**
 * Processes github link
 * 
 * @param param0 ProcessGithubLink interface
 */
async function processGithubLink({
    link, steps, setLinkReady, setSteps, onFinish
}: ProcessGithubLink) {

    // Link is ready to process
    setLinkReady(true)

    const execute = async () => {
        // Get repo details
        const content = await getGithubRepoInfo(link)

        // If failed to fetch details then abort processing
        if (content === null) {
            onFinish(false)
            return
        }

        // If the repo size if too large, abort
        console.log(content)
        if (content?.size ?? 0 > threshHoldRepoSize) {
            onFinish(false)
            return
        }
        // Mark step 0 as completed
        let newSteps = [...steps]
        newSteps[0].isCompleted = true
        setSteps(newSteps)

        // Get complete index
        // TODO: Here ...
        // const completeIndex = getCompleteIndex(content)

        // Everything is done
        onFinish(true)
    }
    execute()
}

/**
 * Props for Onboarding component
 * 
 * @property onFinish Callback for onboarding gets finished
 */
interface Props {
    onFinish: (isReady: boolean) => void
}

/**
 * Onboarding component processes link and if successful, redirect to Chat
 * 
 * @param param0 Props for the component
 * @returns Onboarding component
 */
const Onboarding: React.FC<Props> = ({ onFinish }) => {
    const [link, setLink] = useState<string>("")
    const [linkReady, setLinkReady] = useState<boolean>(false)
    // Steps for processing
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
                            // Handles enter press => starts processing
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
                // Displays steps of processing when link is ready
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