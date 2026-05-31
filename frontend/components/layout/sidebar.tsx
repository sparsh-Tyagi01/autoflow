'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'

import {
  MessageSquare,
  Bot,
  Workflow,
  BarChart3,
  Settings,
  FileText,
  Sparkles,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { socket } from '@/lib/socket'
import { useEffect } from 'react'

const routes = [
  {
    label: 'Chat',
    icon: MessageSquare,
    href: '/chat',
    color: 'text-violet-500',
  },
  {
    label: 'Agents',
    icon: Bot,
    href: '/agents',
    color: 'text-cyan-500',
  },
  {
    label: 'Knowledge Base',
    icon: FileText,
    href: '/knowledge',
    color: 'text-emerald-500',
  },
  {
    label: 'Workflows',
    icon: Workflow,
    href: '/workflows',
    color: 'text-orange-500',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    color: 'text-pink-500',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: 'text-muted-foreground',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && user.id) {
      socket.connect()
      socket.emit('join:user', user.id)
      console.log('Socket connected & joined user room:', user.id)
    } else {
      socket.disconnect()
    }
    return () => {
      socket.disconnect()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      useAuthStore.getState().setUser(null)
      router.push('/login')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="hidden md:flex h-full w-72 flex-col border-r border-border/50 bg-card/30 backdrop-blur-sm">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">AutoFlow</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col gap-1 px-3">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = pathname === route.href || pathname?.startsWith(route.href + '/')

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-violet-500/10 to-cyan-500/10 text-foreground border border-violet-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isActive ? route.color : ''
                )}
              />
              {route.label}
            </Link>
          )
        })}
      </div>

      {/* Bottom section */}
      <div className="p-3 space-y-2 border-t border-border/50">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all w-full"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        {/* User info & Logout */}
        {user && (
          <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}