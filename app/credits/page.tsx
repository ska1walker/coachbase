'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { ArrowLeft } from 'lucide-react'

export default function CreditsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user)
    })
    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-[#3e31a2] overflow-hidden relative">
      {/* Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-b from-transparent via-black to-transparent bg-[length:100%_4px] animate-scanlines" />

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c71da]/30 hover:bg-[#7c71da]/50 text-[#c7ffed] transition-smooth border border-[#c7ffed]/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-mono">BACK</span>
        </Link>
      </div>

      {/* Credits Container */}
      <div className="h-screen flex items-end justify-center overflow-hidden">
        <div className="credits-scroll w-full max-w-4xl px-8 text-center">
          {/* Title */}
          <div className="mb-16">
            <div className="text-6xl md:text-8xl font-bold mb-4 text-[#c7ffed] tracking-wider animate-pulse-slow font-mono">
              COACHBASE
            </div>
            <div className="text-2xl md:text-3xl text-[#7c71da] font-mono">
              ═══════════════════════
            </div>
          </div>

          {/* Dedication */}
          <div className="mb-20 space-y-6">
            <div className="text-xl md:text-2xl text-[#ffb7c5] font-mono animate-pulse-slow">
              ★ ★ ★ ★ ★ ★ ★ ★ ★ ★
            </div>
            <div className="text-3xl md:text-5xl font-bold text-[#ffb7c5] font-mono leading-relaxed">
              DEDICATED TO
            </div>
            <div className="text-5xl md:text-7xl font-bold text-[#c7ffed] font-mono animate-pulse-slow my-8">
              MATS & NICLAS
            </div>
            <div className="text-xl md:text-2xl text-[#7c71da] font-mono italic">
              "The Best Sons in the Universe"
            </div>
            <div className="text-2xl md:text-3xl text-[#ffb7c5] font-mono">
              ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥ ♥
            </div>
          </div>

          {/* Credits Sections */}
          <div className="space-y-16 mb-16">
            {/* Created By */}
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#c7ffed] mb-4 font-mono">
                ─── CREATED BY ───
              </div>
              <div className="text-xl md:text-2xl text-[#7c71da] font-mono">
                KAI BÖHM
              </div>
              <div className="text-lg text-[#7c71da]/70 font-mono mt-2">
                Developer • Coach • Dad
              </div>
            </div>

            {/* Powered By */}
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#c7ffed] mb-4 font-mono">
                ─── POWERED BY ───
              </div>
              <div className="space-y-2 text-lg md:text-xl text-[#7c71da] font-mono">
                <div>NEXT.JS 15</div>
                <div>REACT 18</div>
                <div>TYPESCRIPT</div>
                <div>FIREBASE</div>
                <div>TAILWIND CSS</div>
                <div>VERCEL</div>
              </div>
            </div>

            {/* AI Assistant */}
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#c7ffed] mb-4 font-mono">
                ─── AI ASSISTANCE ───
              </div>
              <div className="text-xl md:text-2xl text-[#7c71da] font-mono">
                CLAUDE SONNET 4.5
              </div>
              <div className="text-lg text-[#7c71da]/70 font-mono mt-2">
                by Anthropic
              </div>
              <div className="text-md text-[#7c71da]/50 font-mono mt-4">
                Built with Claude Code CLI
              </div>
            </div>

            {/* Special Thanks */}
            <div>
              <div className="text-2xl md:text-3xl font-bold text-[#c7ffed] mb-4 font-mono">
                ─── SPECIAL THANKS ───
              </div>
              <div className="space-y-2 text-lg text-[#7c71da] font-mono">
                <div>All Coaches using CoachBase</div>
                <div>The Open Source Community</div>
                <div>Coffee ☕</div>
                <div>Late Night Coding Sessions</div>
              </div>
            </div>

            {/* Message */}
            <div className="my-20">
              <div className="text-xl md:text-2xl text-[#ffb7c5] font-mono leading-relaxed">
                "This app was built for you, Mats & Niclas."
              </div>
              <div className="text-xl md:text-2xl text-[#ffb7c5] font-mono leading-relaxed mt-4">
                "May you always play fair, dream big,"
              </div>
              <div className="text-xl md:text-2xl text-[#ffb7c5] font-mono leading-relaxed">
                "and never stop being awesome!"
              </div>
              <div className="text-3xl md:text-4xl text-[#c7ffed] font-mono mt-8">
                - Dad
              </div>
            </div>

            {/* Year */}
            <div>
              <div className="text-2xl md:text-3xl text-[#7c71da] font-mono">
                ═══════════════════════
              </div>
              <div className="text-xl md:text-2xl text-[#c7ffed] font-mono mt-4">
                © 2026 COACHBASE
              </div>
              <div className="text-lg text-[#7c71da] font-mono mt-2">
                Made with ❤️ in Germany
              </div>
            </div>
          </div>

          {/* End Screen */}
          <div className="mb-32 space-y-6">
            <div className="text-3xl md:text-4xl font-bold text-[#ffb7c5] font-mono animate-pulse-slow">
              ★ ★ ★ THE END ★ ★ ★
            </div>
            <div className="text-xl md:text-2xl text-[#7c71da] font-mono animate-pulse">
              PRESS ANY KEY TO CONTINUE
            </div>
            <div className="text-sm text-[#7c71da]/50 font-mono">
              (or just scroll back up)
            </div>
          </div>

          {/* Spacer for scroll */}
          <div className="h-screen" />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .credits-scroll {
          animation: scroll-up 60s linear infinite;
        }

        @keyframes scroll-up {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }

        @keyframes scanlines {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100%;
          }
        }

        .animate-scanlines {
          animation: scanlines 8s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* Pause animation on hover */
        .credits-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
