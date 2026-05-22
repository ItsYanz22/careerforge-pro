import { Link } from '@tanstack/react-router'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-2xl text-muted-foreground mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-block gradient-primary hover:shadow-accent text-white px-8 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
