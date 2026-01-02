import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { IMessage } from '../types/chat.type';

interface ISocketData {
  user?: {
    sub: string;
  };
}

function getUserId(client: Socket): string | undefined {
  const data = client.data as ISocketData;
  return data.user?.sub;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket): void {
    const userId = getUserId(client);
    if (!userId) {
      void client.disconnect();
      return;
    }
    this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    void client.join(`user:${userId}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = getUserId(client);
    this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): Promise<void> {
    const userId = getUserId(client);
    if (!userId) {
      return;
    }
    try {
      await this.chatService.getChatById(data.chatId, userId);
      void client.join(`chat:${data.chatId}`);
      this.logger.log(`User ${userId} joined chat ${data.chatId}`);
    } catch (error) {
      this.logger.error(`Error joining chat: ${error}`);
    }
  }

  @SubscribeMessage('leave-chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ): void {
    void client.leave(`chat:${data.chatId}`);
    this.logger.log(`User left chat ${data.chatId}`);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ): Promise<IMessage> {
    const userId = getUserId(client);
    if (!userId) {
      throw new Error('Unauthorized');
    }
    try {
      const message = await this.chatService.createMessage(
        userId,
        createMessageDto,
      );
      this.server.to(`chat:${createMessageDto.chatId}`).emit('new-message', {
        chatId: createMessageDto.chatId,
        message,
      });
      return message;
    } catch (error) {
      this.logger.error(`Error sending message: ${error}`);
      throw error;
    }
  }

  async notifyNewMessage(chatId: string, message: IMessage): Promise<void> {
    await Promise.resolve();
    this.server.to(`chat:${chatId}`).emit('new-message', {
      chatId,
      message,
    });
  }
}
