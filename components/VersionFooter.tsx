'use client'

import { useEffect, useState } from 'react'

/**
 * Version Footer Component
 *
 * Shows app version and git commit hash (if available)
 * Helps to identify which deployment is running
 */
export function VersionFooter() {
  const [gitCommit, setGitCommit] = useState<string>('')

  useEffect(() => {
    // Try to get git commit from environment variable (set during build)
    const commit = process.env.NEXT_PUBLIC_GIT_COMMIT || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
    if (commit) {
      setGitCommit(commit.substring(0, 7)) // Short hash
    }
  }, [])

  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.2.0'

  return (
    <footer className="fixed bottom-0 right-0 p-2 text-xs text-mid-grey/60 pointer-events-none z-50">
      <div className="flex items-center gap-2">
        <span>v{version}</span>
        {gitCommit && (
          <>
            <span>•</span>
            <span className="font-mono">{gitCommit}</span>
          </>
        )}
      </div>
    </footer>
  )
}
