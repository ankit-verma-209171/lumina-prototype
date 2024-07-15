"use client";

import Image from 'next/image'
import React, {useState} from 'react'
import GithubLogo from '../images/github.png'
import {getCompleteSummary, getGithubRepoInfo} from '../manager/gitmanager';
import {isNotBinary} from "@/app/manager/filemanager";
import {ProjectRef} from "@/app/models/ProjectRef";

const threshHoldRepoSize = 50_000 // characters ~= 50K tokens

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
    onFinish: (isReady: boolean, projectRef: ProjectRef | null) => void,
}

/**
 * Processes github link
 *
 * @param param0 ProcessGithubLink interface
 */
async function processGithubLink({
                                     link, steps, setLinkReady, setSteps, onFinish
                                 }: ProcessGithubLink) {

    console.log("Started processing")
    // Link is ready to process
    setLinkReady(true)

    // Get repo details
    const content = await getGithubRepoInfo(link)
    console.log("Getting content")

    // If failed to fetch details then abort processing
    if (content === null) {
        console.log("Got content null")

        onFinish(false, null)
        return
    }

    // If the repo size if too large, abort
    console.log(content)
    const repoSize = content.tree
        .filter(node => node.type === 'blob' && isNotBinary(node))
        .reduce((total, acc) => total + (acc.size ?? 0), 0)

    console.log("Repo size", repoSize)
    if (repoSize > threshHoldRepoSize) {
        onFinish(false, null)
        return
    }
    // Mark step 0 as completed
    let newSteps = [...steps]
    newSteps[0].isCompleted = true
    setSteps(newSteps)

    // Get complete index
    const completeSummary = await getCompleteSummary(content)
    const projectRef = new ProjectRef()
    completeSummary.forEach(summary => {
        const [file, content, brief] = summary
        if (brief != null) {
            projectRef.completeContent.set(file, content)
            projectRef.completeSummary.set(file, brief)
        }
    })

    // Mark step 1 as completed
    newSteps = [...steps]
    newSteps[1].isCompleted = true
    setSteps(newSteps)

    // Everything is done
    onFinish(true, projectRef)
}

/**
 * Props for Onboarding component
 *
 * @property onFinish Callback for onboarding gets finished
 */
interface Props {
    onFinish: (isReady: boolean, projectRef: ProjectRef | null) => void
}

/**
 * Onboarding component processes link and if successful, redirect to Chat
 *
 * @param param0 Props for the component
 * @returns Onboarding component
 */
const Onboarding: React.FC<Props> = ({onFinish}) => {
    const [link, setLink] = useState<string>("")
    const [linkReady, setLinkReady] = useState<boolean>(false)

    // Steps for processing
    const [steps, setSteps] = useState<Step[]>(
        [
            {name: "Summarizing project", isCompleted: false},
            {name: "Finishing setup", isCompleted: false},
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
                                    onFinish: (isReady, projectRef) => onFinish(isReady, projectRef)
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
                                <input type="checkbox" checked={step.isCompleted} readOnly
                                       className="checkbox checkbox-primary me-3"/>
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