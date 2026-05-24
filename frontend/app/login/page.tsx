'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { api } from '@/lib/axios'

import { useAuthStore } from '@/store/auth-store'

export default function LoginPage() {
  const router = useRouter()

  const { setUser } = useAuthStore()

  const [email, setEmail] = useState('')

  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const login = async () => {
    try {
      setLoading(true)

      const response = await api.post(
        '/auth/login',
        {
          email,
          password,
        }
      )

      setUser(response.data.user)

      router.push('/chat')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border p-8">
        <h1 className="mb-6 text-3xl font-bold">
          Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border p-3"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border p-3"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            onClick={login}
            disabled={loading}
            className="w-full rounded-xl bg-black p-3 text-white"
          >
            {loading
              ? 'Loading...'
              : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}