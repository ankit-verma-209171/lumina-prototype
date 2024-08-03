"use client";

import Image from 'next/image'
import React, {useState} from 'react'
import GithubLogo from '@/images/github.png'
import {getCompleteSummary, getGithubRepoInfo} from '@/manager/gitmanager';
import {isImportantFile} from "@/manager/filemanager";
import {ProjectRef} from "@/models/ProjectRef";

const threshHoldRepoSize = 1_386_245 // characters ~= 1M tokens

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
 * @property setLinkReady Update if link is ready for processing
 * @property setProgress Update the progress
 * @property setError Update the error
 * @property onFinish Callback when finished with the process or aborted
 */
interface ProcessGithubLink {
    link: string,
    setLinkReady: (isReady: boolean) => void,
    setProgress: (progress: string) => void,
    setError: (error: string) => void,
    onFinish: (isReady: boolean, projectRef: ProjectRef | null) => void,
}

/**
 * Processes github link
 *
 * @param param0 ProcessGithubLink interface
 */
async function processGithubLink({
    link, setLinkReady, setProgress, setError, onFinish
}: ProcessGithubLink) {

    if (process.env.DEBUG === "yes") {
        console.log("Started processing")
    }

    // Link is ready to process
    setLinkReady(true)

    // Get repo details
    const content = await getGithubRepoInfo(link)
    if (process.env.DEBUG === "yes") {
        console.log("Getting content")
    }

    // If failed to fetch details then abort processing
    if (content === null) {
        if (process.env.DEBUG === "yes") {
            console.log("Got content null")
        }

        onFinish(false, null)
        return
    }

    // If the repo size if too large, abort
    if (process.env.DEBUG === "yes") {
        console.log(content)
    }
    const repoTree = content.tree
        .filter(node => node.type === 'blob' && isImportantFile(node))
    if (process.env.DEBUG === "yes") {
        console.log(repoTree)
    }
    const repoSize = repoTree
        .reduce((total, acc) => total + (acc.size ?? 0), 0)
    if (process.env.DEBUG === "yes") {
        console.log("Repo size", repoSize)
    }
    if (repoSize > threshHoldRepoSize) {
        setError("Project is too big!")
        onFinish(false, null)
        return
    }
    // Mark step 0 as completed
    setProgress(steps[0])

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
    setProgress(steps[1])

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

const steps = [
    "Summarizing project ...",
    "Finishing setup ...",
]

/**
 * Onboarding component processes link and if successful, redirect to Chat
 *
 * @param param0 Props for the component
 * @returns Onboarding component
 */
const Onboarding: React.FC<Props> = ({onFinish}) => {
    const [link, setLink] = useState<string>("")
    const [linkReady, setLinkReady] = useState<boolean>(false)
    const [progress, setProgress] = useState<string>("")
    const [error, setError] = useState<string>("")

    const processGithubLinkAction = async () => {
        if (link) {
            await processGithubLink({
                link: link,
                setLinkReady: (isReady) => setLinkReady(isReady),
                setProgress: (progress) => setProgress(progress),
                setError: (error) => setError(error),
                onFinish: (isReady, projectRef) => onFinish(isReady, projectRef)
            })
        }
    }

    return (
        <main className="flex flex-col justify-center items-center h-screen">
            <div className="flex flex-col gap-6 px-8">
                <h1 className="text-3xl md:text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-custom-pink to-custom-purple">Hello, Shubham</h1>
                <h2 className="text-semi-white font-semibold md:text-5xl text-3xl">What Code we are Understanding today?</h2>
                <div className="flex flex-col justify-center sm:flex-row mt-5 gap-4">
                    <label className="focus:outline-none input input-bordered font-semibold flex items-center rounded-lg gap-6 py-6 md:w-9/12">
                        <Image
                            className="size-7"
                            src={GithubLogo}
                            alt='github-logo'
                        />
                        <input
                            placeholder="Enter Github Project Link"
                            value={link}
                            type="text"
                            className="w-full"
                            onKeyDown={async (e) => {
                                // Handles enter press => starts processing
                                if (e.key === 'Enter') {
                                    processGithubLinkAction();
                                }
                            }}
                            onChange={(event) => {
                                setLink(event.target.value)
                            }}
                        />
                    </label>
                    <button
                        type="submit"
                        onClick={processGithubLinkAction}
                        className="bg-white px-8 md:px-16 rounded-lg text-black focus:outline-none max-w-[150px] md:max-w-[180px] h-[50px]"
                    >
                        Submit
                    </button>
                </div>
            </div>
            {
                // Displays progress
                linkReady && progress.length > 0 &&
                (<div className="flex flex-col min-w-9 items-start py-4">
                    {progress}
                </div>)
            }
            {
                // Displays error
                linkReady && error.length > 0 &&
                (<div className="flex flex-col min-w-9 items-start text-error py-4">
                    {error}
                </div>)
            }
        </main>
    )
}

export default Onboarding