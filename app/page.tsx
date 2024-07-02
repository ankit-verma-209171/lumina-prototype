"use client";

import { useState } from "react"
import LuminaAi from "./components/LuminaAi"

export default function App() {
  const [isReadyForChat, setIsReadyForChat] = useState(false)

  return <LuminaAi />
}
