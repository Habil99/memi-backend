import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import { CreateChatDto } from '../dtos/create-chat.dto';
import { IChat } from '../types/chat.type';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({
    status: 201,
    description: 'Chat created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        productId: '123e4567-e89b-12d3-a456-426614174001',
        buyerId: '123e4567-e89b-12d3-a456-426614174002',
        sellerId: '123e4567-e89b-12d3-a456-426614174003',
        isBlocked: false,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createChat(
    @Request() req: { user: Express.User },
    @Body() createChatDto: CreateChatDto,
  ): Promise<IChat> {
    return this.chatService.createChat(req.user.id, createChatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user chats' })
  @ApiResponse({
    status: 200,
    description: 'Chats retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          productId: '123e4567-e89b-12d3-a456-426614174001',
          messages: [],
        },
      ],
    },
  })
  async getUserChats(@Request() req: { user: Express.User }): Promise<IChat[]> {
    return this.chatService.getUserChats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat by ID with messages' })
  @ApiParam({ name: 'id', description: 'Chat ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Chat retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        productId: '123e4567-e89b-12d3-a456-426614174001',
        messages: [
          {
            id: '123e4567-e89b-12d3-a456-426614174004',
            content: 'Hello, is this available?',
            senderId: '123e4567-e89b-12d3-a456-426614174002',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async getChatById(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
  ): Promise<IChat> {
    return this.chatService.getChatById(id, req.user.id);
  }

  @Put(':id/block')
  @ApiOperation({ summary: 'Block a chat' })
  @ApiParam({ name: 'id', description: 'Chat ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Chat blocked successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isBlocked: true,
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async blockChat(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
  ): Promise<IChat> {
    return this.chatService.blockChat(id, req.user.id);
  }

  @Put(':id/unblock')
  @ApiOperation({ summary: 'Unblock a chat' })
  @ApiParam({ name: 'id', description: 'Chat ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Chat unblocked successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isBlocked: false,
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async unblockChat(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
  ): Promise<IChat> {
    return this.chatService.unblockChat(id, req.user.id);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      example: {
        message: 'Chat module is working',
      },
    },
  })
  test(): { message: string } {
    return { message: 'Chat module is working' };
  }
}
