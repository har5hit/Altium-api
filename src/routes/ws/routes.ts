import type { FastifyInstance } from 'fastify';
import type { WebSocket } from '@fastify/websocket';

export default async function wsRoutes(fastify: FastifyInstance) {
  fastify.get('/echo', { websocket: true }, (socket: WebSocket, _request) => {
    socket.on('message', (message: Buffer) => {
      socket.send(message.toString());
    });
  });
}
