"use client";

import { useState } from "react"
import LuminaAi from "./components/LuminaAi"
import Onboarding from "./components/Onboarding";

export default function App() {
  const [isReadyForChat, setIsReadyForChat] = useState(false)

  if (isReadyForChat) {
    return <LuminaAi />
  } else {
    return <Onboarding onFinish={(isReady) => setIsReadyForChat(isReady)} />
  }
}
