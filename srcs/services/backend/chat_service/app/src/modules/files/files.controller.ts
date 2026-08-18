import type { FastifyRequest, FastifyReply } from 'fastify'
import { randomUUID } from 'crypto'
import path from 'path'
import { pipeline } from 'stream/promises'
import { createWriteStream, createReadStream } from 'fs'
import { unlink } from 'fs/promises'
import { Readable } from 'stream'
import { env } from '../../config/env.js'
import { isAllowedFile, saveFileRecord, getFileById, deleteFileRecord } from './files.service.js'
import { isChannelMember } from '../channels/channels.service.js'
import { createMessage } from '../messages/messages.service.js'
import { wsMessageCreated } from '../websocket/websocket.ws.js'

export async function uploadFileController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { channelId } = request.params as { channelId: string }
    const chId = Number(channelId)

    if (!(await isChannelMember(chId, request.user!.id))) {
      await reply.status(403).send({ message: 'Not a channel member' })
      return
    }

    const data = await request.file()
    if (!data) {
      await reply.status(400).send({ message: 'No file provided' })
      return
    }

    const buffer = await data.toBuffer()
    const check = isAllowedFile(data.mimetype, buffer.length)
    if (!check.valid) {
      await reply.status(400).send({ message: check.reason })
      return
    }

    const storedName = `${randomUUID()}${path.extname(data.filename)}`
    const filepath = path.join(env.uploadsDir, storedName)
    await pipeline(Readable.from(buffer), createWriteStream(filepath))

    const record = await saveFileRecord({
      channelId: chId,
      uploaderId: request.user!.id,
      originalName: data.filename,
      storedName,
      mimeType: data.mimetype,
      size: buffer.length,
    })

    // create message for file, to appear in conversation
    const message = await createMessage(chId, request.user!.id, data.filename, 'user', record!.id)
    wsMessageCreated(message)

    await reply.status(201).send(message)
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function downloadFileController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const file = await getFileById(Number(id))
    if (!file) {
      await reply.status(404).send({ message: 'File not found' })
      return
    }

    if (!(await isChannelMember(file.channelId, request.user!.id))) {
      await reply.status(403).send({ message: 'Not a channel member' })
      return
    }

    const filepath = path.join(env.uploadsDir, file.storedName)
    reply.header('Content-Type', file.mimeType)
    reply.header('Content-Disposition', `inline; filename="${file.originalName}"`)
    return reply.send(createReadStream(filepath))
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}

export async function deleteFileController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const { id } = request.params as { id: string }
    const file = await getFileById(Number(id))
    if (!file) {
      await reply.status(404).send({ message: 'File not found' })
      return
    }

    if (file.uploaderId !== request.user!.id && request.user!.role !== 'admin') {
      await reply.status(403).send({ message: 'Not allowed to delete this file' })
      return
    }

    await unlink(path.join(env.uploadsDir, file.storedName)).catch(() => {})
    await deleteFileRecord(file.id)
    await reply.send({ message: 'File deleted' })
  } catch (err) {
    request.log.error(err)
    await reply.status(500).send({ message: 'Internal error' })
  }
}