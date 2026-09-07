import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class KitchenGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    client.join('kitchen');
  }

  @SubscribeMessage('kitchen:join')
  joinKitchen(@ConnectedSocket() client: Socket) {
    client.join('kitchen');
    return { ok: true };
  }

  @SubscribeMessage('kitchen:leave')
  leaveKitchen(@ConnectedSocket() client: Socket) {
    client.leave('kitchen');
    return { ok: true };
  }

  @SubscribeMessage('table:join')
  joinTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { tableId?: string },
  ) {
    if (body?.tableId) {
      client.join(`table:${body.tableId}`);
    }
    return { ok: true };
  }

  emitKitchenQueueUpdated(payload: unknown) {
    this.server.to('kitchen').emit('kitchen:queue-updated', payload);
  }

  emitOrderItemUpdated(payload: {
    itemId: string;
    orderId: string;
    tableId?: string;
    status?: string;
  }) {
    this.server.to('kitchen').emit('order:item-updated', payload);
    if (payload.tableId) {
      this.server.to(`table:${payload.tableId}`).emit('order:item-updated', payload);
    }
  }

  emitInventoryUpdated(payload: unknown) {
    this.server.to('kitchen').emit('inventory:updated', payload);
  }

  emitMenuItemUpdated(payload: unknown) {
    this.server.to('kitchen').emit('menu:item-updated', payload);
  }
}
