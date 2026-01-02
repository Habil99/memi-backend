import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/services/prisma.service';
import { CreateChatDto } from '../dtos/create-chat.dto';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { IChat, IMessage } from '../types/chat.type';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createChat(
    userId: string,
    createChatDto: CreateChatDto,
  ): Promise<IChat> {
    const product = await this.prisma.product.findUnique({
      where: { id: createChatDto.productId },
      include: { seller: true },
    });
    if (!product) {
      throw new NotFoundException(
        `Product with ID "${createChatDto.productId}" not found`,
      );
    }
    if (product.sellerId === userId) {
      throw new BadRequestException(
        'Seller cannot create a chat for their own product',
      );
    }
    const existingChat = await this.prisma.chat.findUnique({
      where: {
        productId_buyerId: {
          productId: createChatDto.productId,
          buyerId: userId,
        },
      },
    });
    if (existingChat) {
      if (existingChat.isBlocked) {
        throw new ForbiddenException('This chat is blocked');
      }
      return this.mapChatToIChat(existingChat);
    }
    const chat = await this.prisma.chat.create({
      data: {
        productId: createChatDto.productId,
        buyerId: userId,
        sellerId: product.sellerId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    return this.mapChatToIChat(chat);
  }

  async createMessage(
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<IMessage> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: createMessageDto.chatId },
    });
    if (!chat) {
      throw new NotFoundException(
        `Chat with ID "${createMessageDto.chatId}" not found`,
      );
    }
    if (chat.isBlocked) {
      throw new ForbiddenException('This chat is blocked');
    }
    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new ForbiddenException('You are not a participant in this chat');
    }
    const messages = await this.prisma.message.findMany({
      where: { chatId: createMessageDto.chatId },
      orderBy: { createdAt: 'asc' },
    });
    if (messages.length === 0 && chat.sellerId === userId) {
      throw new BadRequestException('Seller cannot send the first message');
    }
    const message = await this.prisma.message.create({
      data: {
        chatId: createMessageDto.chatId,
        senderId: userId,
        content: createMessageDto.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    await this.prisma.chat.update({
      where: { id: createMessageDto.chatId },
      data: { updatedAt: new Date() },
    });
    return this.mapMessageToIMessage(message);
  }

  async getChatById(chatId: string, userId: string): Promise<IChat> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!chat) {
      throw new NotFoundException(`Chat with ID "${chatId}" not found`);
    }
    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new ForbiddenException('You are not a participant in this chat');
    }
    return this.mapChatToIChat(chat);
  }

  async getUserChats(userId: string): Promise<IChat[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return chats.map((chat) => this.mapChatToIChat(chat));
  }

  async blockChat(chatId: string, userId: string): Promise<IChat> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) {
      throw new NotFoundException(`Chat with ID "${chatId}" not found`);
    }
    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new ForbiddenException('You are not a participant in this chat');
    }
    const updatedChat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { isBlocked: true },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    return this.mapChatToIChat(updatedChat);
  }

  async unblockChat(chatId: string, userId: string): Promise<IChat> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chat) {
      throw new NotFoundException(`Chat with ID "${chatId}" not found`);
    }
    if (chat.buyerId !== userId && chat.sellerId !== userId) {
      throw new ForbiddenException('You are not a participant in this chat');
    }
    const updatedChat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { isBlocked: false },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              take: 1,
              select: { url: true },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    return this.mapChatToIChat(updatedChat);
  }

  private mapChatToIChat(chat: any): IChat {
    return {
      id: chat.id,
      productId: chat.productId,
      buyerId: chat.buyerId,
      sellerId: chat.sellerId,
      isBlocked: chat.isBlocked,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      product: chat.product
        ? {
            id: chat.product.id,
            title: chat.product.title,
            price: Number(chat.product.price),
            images: chat.product.images || [],
          }
        : undefined,
      buyer: chat.buyer
        ? {
            id: chat.buyer.id,
            name: chat.buyer.name,
            avatar: chat.buyer.avatar,
          }
        : undefined,
      seller: chat.seller
        ? {
            id: chat.seller.id,
            name: chat.seller.name,
            avatar: chat.seller.avatar,
          }
        : undefined,
      messages: chat.messages
        ? chat.messages.map((m: any) => this.mapMessageToIMessage(m))
        : undefined,
    };
  }

  private mapMessageToIMessage(message: any): IMessage {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      sender: message.sender
        ? {
            id: message.sender.id,
            name: message.sender.name,
            avatar: message.sender.avatar,
          }
        : undefined,
    };
  }
}
