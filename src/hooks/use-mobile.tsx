"use client"

import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback)
  return () => {
    window.removeEventListener("resize", callback)
  }
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerSnapshot() {
  return false // A sensible default for the server
}

export function useIsMobile() {
  // The useSyncExternalStore hook is the recommended way to subscribe to external stores,
  // and it's perfect for handling browser APIs in a way that is compatible with SSR.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
