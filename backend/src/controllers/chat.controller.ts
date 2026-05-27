import { Request, Response } from 'express'

import axios from 'axios'

export async function chat(
  req: Request,
  res: Response
) {
  try {
    const { message } = req.body

    const response = await axios({
      method: 'post',
      url: `${process.env.AI_SERVICE_URL}/chat`,
      data: {
        message,
      },
      responseType: 'stream',
    })

    res.setHeader(
      'Content-Type',
      'text/plain'
    )

    response.data.pipe(res)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Streaming error',
    })
  }
}