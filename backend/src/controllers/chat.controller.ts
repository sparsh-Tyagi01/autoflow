import { Request, Response } from 'express'

import axios from 'axios'

export async function chat(
  req: Request,
  res: Response
) {
  try {
    const { message } = req.body

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/chat`,
      {
        message,
      }
    )

    return res.json({
      response:
        response.data.response,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'AI service error',
    })
  }
}