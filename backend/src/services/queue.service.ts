import { Queue, Worker, Job } from 'bullmq'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import { Upload } from '../models/upload.model'
import { emitNotification, getIO } from '../socket/socket'

interface IngestionJobData {
  uploadId: string
  filePath: string
  originalName: string
  userId: string
}

// Parse Redis URL for BullMQ connection options
const getRedisConnectionOptions = () => {
  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379'),
      password: parsed.password || undefined,
    }
  } catch (error) {
    console.error('Failed to parse REDIS_URL, using local fallback:', error)
    return {
      host: '127.0.0.1',
      port: 6379,
    }
  }
}

const connectionOptions = getRedisConnectionOptions()

// 1. Initialize BullMQ Ingestion Queue
export const documentIngestionQueue = new Queue('document-ingestion', {
  connection: connectionOptions,
})

let ingestionWorker: Worker | null = null

// 2. Start the Background Worker
export function startIngestionWorker() {
  if (ingestionWorker) return

  ingestionWorker = new Worker(
    'document-ingestion',
    async (job: Job<IngestionJobData>) => {
      const { uploadId, filePath, originalName, userId } = job.data
      console.log(`[Queue Worker] Processing job ${job.id} for file: ${originalName}`)

      try {
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found at path: ${filePath}`)
        }

        // Read file contents
        const fileBuffer = fs.readFileSync(filePath)
        const blob = new Blob([fileBuffer])
        const formData = new FormData()
        formData.append('file', blob, originalName)

        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'
        console.log(`[Queue Worker] Forwarding ingestion payload to AI service at ${aiServiceUrl}/rag/upload`)

        const aiResponse = await axios.post(
          `${aiServiceUrl}/rag/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )

        console.log(`[Queue Worker] AI service success: parsed ${aiResponse.data.chunks} chunks`)

        // Update MongoDB Upload status to ready
        await Upload.findByIdAndUpdate(uploadId, {
          status: 'ready',
          chunks: aiResponse.data.chunks || 0,
        })

        // Notify client via Socket.IO
        try {
          emitNotification(userId, {
            title: 'Knowledge Ingestion Complete',
            message: `"${originalName}" has been successfully chunked and added to your knowledge base (${aiResponse.data.chunks || 0} chunks created).`,
            type: 'success',
          })

          const io = getIO()
          io.to(`user:${userId}`).emit('knowledge:update', {
            uploadId,
            status: 'ready',
            chunks: aiResponse.data.chunks || 0,
          })
        } catch (socketErr) {
          console.warn('[Queue Worker] Failed to send socket notification:', socketErr)
        }

      } catch (error: any) {
        console.error(`[Queue Worker] Ingestion job ${job.id} failed:`, error.message || error)

        // Update MongoDB Upload status to failed
        await Upload.findByIdAndUpdate(uploadId, {
          status: 'failed',
        })

        // Notify client of failure
        try {
          emitNotification(userId, {
            title: 'Knowledge Ingestion Failed',
            message: `Could not process file "${originalName}". Please try again.`,
            type: 'error',
          })

          const io = getIO()
          io.to(`user:${userId}`).emit('knowledge:update', {
            uploadId,
            status: 'failed',
          })
        } catch (socketErr) {
          console.warn('[Queue Worker] Failed to send socket notification:', socketErr)
        }

        throw error // Re-throw to let BullMQ mark job as failed
      }
    },
    {
      connection: connectionOptions,
      concurrency: 2, // Process up to 2 uploads concurrently
    }
  )

  ingestionWorker.on('completed', (job) => {
    console.log(`[Queue Worker] Job ${job.id} completed successfully`)
  })

  ingestionWorker.on('failed', (job, err) => {
    console.error(`[Queue Worker] Job ${job?.id} failed with error:`, err)
  })

  console.log('[Queue Worker] Document ingestion background worker started')
}

// 3. Initialize BullMQ Workflow Execution Queue
export const workflowExecutionQueue = new Queue('workflow-execution', {
  connection: connectionOptions,
})

let workflowWorker: Worker | null = null

// Syncs workflow cron schedules in BullMQ
export async function syncWorkflowSchedule(workflow: any) {
  // Remove any existing repeatable jobs for this workflow
  const repeatableJobs = await workflowExecutionQueue.getRepeatableJobs()
  for (const job of repeatableJobs) {
    if (job.name === workflow._id.toString()) {
      await workflowExecutionQueue.removeRepeatableByKey(job.key)
      console.log(`[Queue Service] Removed repeatable job for workflow: ${workflow._id}`)
    }
  }

  // If workflow is active and trigger type is schedule, add repeatable job
  if (workflow.status === 'active' && workflow.trigger?.type === 'schedule') {
    const cronPattern = workflow.trigger.config?.cron || '0 * * * *' // Default to every hour
    await workflowExecutionQueue.add(
      workflow._id.toString(),
      { workflowId: workflow._id.toString() },
      {
        repeat: {
          pattern: cronPattern,
        },
        jobId: workflow._id.toString(),
      }
    )
    console.log(`[Queue Service] Scheduled workflow ${workflow._id} with cron: ${cronPattern}`)
  }
}

// Removes workflow from BullMQ repeatable jobs list
export async function removeWorkflowSchedule(workflowId: string) {
  const repeatableJobs = await workflowExecutionQueue.getRepeatableJobs()
  for (const job of repeatableJobs) {
    if (job.name === workflowId) {
      await workflowExecutionQueue.removeRepeatableByKey(job.key)
      console.log(`[Queue Service] Removed repeatable job for workflow ID: ${workflowId}`)
    }
  }
}

// 4. Start the Workflow Execution Worker
export function startWorkflowWorker() {
  if (workflowWorker) return

  workflowWorker = new Worker(
    'workflow-execution',
    async (job: Job<{ workflowId: string }>) => {
      const { workflowId } = job.data
      console.log(`[Queue Worker] Executing scheduled workflow: ${workflowId}`)

      try {
        const { Workflow } = require('../models/workflow.model')
        const workflow = await Workflow.findById(workflowId)
        if (!workflow) {
          console.warn(`[Queue Worker] Workflow ${workflowId} not found, ignoring.`)
          return
        }

        if (workflow.status !== 'active') {
          console.warn(`[Queue Worker] Workflow ${workflowId} is not active, ignoring.`)
          return
        }

        console.log(`[Queue Worker] Running nodes for workflow "${workflow.name}"`)
        
        let context = "Workflow execution triggered."
        
        // Simple sequential nodes execution
        for (const node of workflow.nodes) {
          console.log(`[Queue Worker] Executing node: ${node.label} (${node.type})`)
          
          if (node.type === 'ai') {
            const prompt = node.config?.prompt || "Execute automated task step"
            const model = node.config?.model || "gemini-2.5-flash-lite"
            
            const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000'
            const response = await axios.post(`${aiServiceUrl}/agents/run`, {
              message: `${prompt}\nContext: ${context}`,
              conversation_id: `workflow-${workflowId}`,
              agent_config: {
                model,
                temperature: node.config?.temperature || 0.7,
                system_prompt: node.config?.systemPrompt || "You are an automated workflow agent."
              }
            })
            
            context = response.data.response || "AI step completed."
            console.log(`[Queue Worker] AI node output: ${context.substring(0, 120)}...`)
          } else if (node.type === 'api') {
            const url = node.config?.url
            const method = node.config?.method || 'POST'
            const headers = node.config?.headers || {}
            const body = node.config?.body || {}
            
            if (url) {
              const response = await axios({
                method,
                url,
                headers,
                data: {
                  ...body,
                  context
                }
              })
              context = JSON.stringify(response.data)
              console.log(`[Queue Worker] API node response: ${context.substring(0, 120)}...`)
            }
          } else if (node.type === 'delay') {
            const duration = node.config?.duration || 1000
            await new Promise(resolve => setTimeout(resolve, duration))
          }
        }

        // Update last run metrics in MongoDB
        await Workflow.findByIdAndUpdate(workflowId, {
          lastRunAt: new Date(),
          $inc: { runCount: 1 }
        })

        console.log(`[Queue Worker] Workflow "${workflow.name}" (${workflowId}) run completed successfully.`)

        // Notify client over socket
        try {
          const { emitNotification } = require('../socket/socket')
          emitNotification(workflow.userId.toString(), {
            title: 'Workflow Run Complete',
            message: `Your scheduled workflow "${workflow.name}" completed running successfully.`,
            type: 'success',
          })
        } catch (socketErr) {
          console.warn('[Queue Worker] Failed to send socket notification for workflow run:', socketErr)
        }

      } catch (error: any) {
        console.error(`[Queue Worker] Scheduled workflow ${workflowId} execution failed:`, error.message || error)
        throw error
      }
    },
    {
      connection: connectionOptions,
      concurrency: 5,
    }
  )

  workflowWorker.on('completed', (job) => {
    console.log(`[Queue Worker] Workflow job ${job.id} completed successfully`)
  })

  workflowWorker.on('failed', (job, err) => {
    console.error(`[Queue Worker] Workflow job ${job?.id} failed with error:`, err)
  })

  console.log('[Queue Worker] Scheduled workflows background worker started')
}

