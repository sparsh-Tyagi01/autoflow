import { Response } from 'express'

import path from 'path'

import fs from 'fs'

import axios from 'axios'

import { Upload } from '../models/upload.model'

import { AuthRequest } from '../middleware/auth.middleware'

import { documentIngestionQueue } from '../services/queue.service'

const UPLOAD_DIR = path.join(__dirname, '../../uploads')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export async function uploadFile(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No file uploaded',
      })
    }

    const upload = await Upload.create({
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      status: 'processing',
      agentId: req.body.agentId || null,
    })

    // Enqueue background processing job
    await documentIngestionQueue.add(`ingest-${upload._id}`, {
      uploadId: upload._id.toString(),
      filePath: req.file.path,
      originalName: req.file.originalname,
      userId: req.userId!,
    })

    console.log(`[HTTP Controller] Enqueued ingestion task for file: ${req.file.originalname}`)

    return res.status(201).json(upload)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Upload failed',
    })
  }
}

export async function getUploads(
  req: AuthRequest,
  res: Response
) {
  try {
    const uploads = await Upload.find({
      userId: req.userId,
    }).sort({ createdAt: -1 })

    return res.json(uploads)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to fetch uploads',
    })
  }
}

export async function deleteUpload(
  req: AuthRequest,
  res: Response
) {
  try {
    const upload = await Upload.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })

    if (!upload) {
      return res.status(404).json({
        message: 'Upload not found',
      })
    }

    // Delete file from disk
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path)
    }

    return res.json({
      message: 'Upload deleted',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Failed to delete upload',
    })
  }
}
