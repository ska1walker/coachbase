'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

let toastQueue: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

function notifyListeners() {
  listeners.forEach(listener => listener([...toastQueue]))
}

export function showToast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).substring(7)
  toastQueue.push({ id, message, type })
  notifyListeners()

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    notifyListeners()
  }, 5000)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter(l => l !== setToasts)
    }
  }, [])

  const removeToast = (id: string) => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    notifyListeners()
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-md pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg shadow-lg p-4 flex items-start gap-3 backdrop-blur-sm border-2 animate-in slide-in-from-right-full duration-300 ${
            toast.type === 'success'
              ? 'bg-neon-lime/90 border-neon-lime text-deep-petrol'
              : toast.type === 'error'
              ? 'bg-red-500/90 border-red-600 text-white'
              : toast.type === 'warning'
              ? 'bg-digital-orange/90 border-digital-orange text-deep-petrol'
              : 'bg-soft-mint/90 dark:bg-deep-petrol/90 border-mid-grey text-deep-petrol dark:text-soft-mint'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5" strokeWidth={2} />}
            {toast.type === 'error' && <XCircle className="w-5 h-5" strokeWidth={2} />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" strokeWidth={2} />}
            {toast.type === 'info' && <Info className="w-5 h-5" strokeWidth={2} />}
          </div>
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>
  )
}
