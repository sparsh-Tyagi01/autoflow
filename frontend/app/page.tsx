import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-7xl font-bold mb-6">
          AutoFlow AI
        </h1>

        <p className="text-muted-foreground mb-8">
          Enterprise AI Agent Operating System
        </p>

        <Link
          href="/chat"
          className="bg-black text-white px-6 py-3 rounded-xl"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  )
}