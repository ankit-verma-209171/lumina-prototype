"use client";

import { useState } from "react"
import LuminaAi from "./components/LuminaAi"
import Onboarding from "./components/Onboarding";

/**
 * App component is root component of the complete application
 * 
 * @returns App component
 */
export default function App() {
  const [isReadyForChat, setIsReadyForChat] = useState(false)

  if (isReadyForChat) {
    return <LuminaAi />
  } else {
    return <Onboarding onFinish={(isReady) => setIsReadyForChat(isReady)} />
  }
}
