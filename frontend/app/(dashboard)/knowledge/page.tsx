'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  File,
  X,
} from 'lucide-react'
import { api } from '@/lib/axios'

interface UploadItem {
  _id: string
  originalName: string
  mimeType: string
  size: number
  status: 'processing' | 'ready' | 'failed'
  chunks: number
  createdAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function KnowledgePage() {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    fetchUploads()
  }, [])

  const fetchUploads = async () => {
    try {
      const response = await api.get('/knowledge')
      setUploads(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await api.post('/knowledge', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setUploads((prev) => [response.data, ...prev])
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/knowledge/${id}`)
      setUploads((prev) => prev.filter((u) => u._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleUpload(e.dataTransfer.files)
  }, [])

  const statusConfig = {
    ready: {
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      label: 'Ready',
    },
    processing: {
      icon: Loader2,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      label: 'Processing',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      label: 'Failed',
    },
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">
            Upload documents to build your AI agents&apos; knowledge
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative mb-8 rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
            dragActive
              ? 'border-violet-500 bg-violet-500/5'
              : 'border-border/50 hover:border-border'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            onChange={(e) => handleUpload(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF, DOCX, TXT, and Markdown — up to 50MB each
              </p>
            </div>
          </div>
        </div>

        {/* Files List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">
              No documents uploaded yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {uploads.map((upload, i) => {
                const status = statusConfig[upload.status]
                const StatusIcon = status.icon

                return (
                  <motion.div
                    key={upload._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <File className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {upload.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(upload.size)}
                        {upload.chunks > 0 && ` · ${upload.chunks} chunks`}
                        {' · '}
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${status.bg} ${status.color}`}
                    >
                      <StatusIcon
                        className={`h-3.5 w-3.5 ${
                          upload.status === 'processing' ? 'animate-spin' : ''
                        }`}
                      />
                      {status.label}
                    </div>

                    <button
                      onClick={() => handleDelete(upload._id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
