'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  MessageSquare,
  Bot,
  Workflow,
  BarChart3,
  Settings,
} from 'lucide-react'

import { cn } from '@/lib/utils'

const routes = [
  {
    label: 'Chat',
    icon: MessageSquare,
    href: '/chat',
  },
  {
    label: 'Agents',
    icon: Bot,
    href: '/agents',
  },
  {
    label: 'Workflows',
    icon: Workflow,
    href: '/workflows',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex h-full w-72 flex-col border-r bg-background">
      <div className="p-6">
        <h1 className="text-3xl font-bold">
          AutoFlow AI
        </h1>
      </div>

      <div className="flex flex-col gap-2 px-4">
        {routes.map((route) => {
          const Icon = route.icon

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-muted',
                pathname === route.href &&
                  'bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />

              {route.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}