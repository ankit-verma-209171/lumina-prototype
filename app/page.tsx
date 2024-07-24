"use client";

import {useState} from "react"
import LuminaAi from "@/components/LuminaAi"
import Onboarding from "@/components/Onboarding";
import {ProjectRef} from "@/models/ProjectRef";

/**
 * App component is root component of the complete application
 *
 * @returns App component
 */
export default function App() {
    const [isReadyForChat, setIsReadyForChat] = useState(false)
    const [projectRef, setProjectRef] = useState<ProjectRef | null>(null)

    if (isReadyForChat) {
        return <LuminaAi projectRef={projectRef} />
    } else {
        return <Onboarding onFinish={(isReady, projectRef) => {
            setIsReadyForChat(isReady)
            setProjectRef(projectRef)
        }}/>
    }
}
