import express from 'express'

import multer from 'multer'

import path from 'path'

import crypto from 'crypto'

import {
  uploadFile,
  getUploads,
  deleteUpload,
} from '../controllers/knowledge.controller'

import { protect } from '../middleware/auth.middleware'

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomUUID()}-${file.originalname}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('File type not supported'))
    }
  },
})

const router = express.Router()

router.use(protect)

router.post('/', upload.single('file'), uploadFile)

router.get('/', getUploads)

router.delete('/:id', deleteUpload)

export default router
