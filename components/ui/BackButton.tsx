'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href?: string
  label?: string
  onClick?: () => void
  className?: string
}

export function BackButton({
  href,
  label = 'Zurück',
  onClick,
  className
}: BackButtonProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault()
      onClick()
    } else if (!href) {
      e.preventDefault()
      router.back()
    }
  }

  const buttonContent = (
    <span className={cn(
      'inline-flex items-center gap-2',
      'text-mid-grey hover:text-deep-petrol dark:hover:text-soft-mint',
      'transition-smooth',
      'text-sm font-medium',
      className
    )}>
      <ArrowLeft className="w-4 h-4" />
      {label}
    </span>
  )

  if (href) {
    return (
      <Link href={href} onClick={handleClick}>
        {buttonContent}
      </Link>
    )
  }

  return (
    <button onClick={handleClick}>
      {buttonContent}
    </button>
  )
}
