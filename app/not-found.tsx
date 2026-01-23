import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-headline font-bold text-neon-lime mb-4">
          404
        </h1>
        <h2 className="text-2xl font-headline font-bold text-deep-petrol dark:text-soft-mint mb-4">
          Seite nicht gefunden
        </h2>
        <p className="text-mid-grey mb-8">
          Die Seite, die du suchst, existiert nicht oder wurde verschoben.
        </p>
        <Link href="/">
          <Button variant="primary">
            Zurück zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  )
}
