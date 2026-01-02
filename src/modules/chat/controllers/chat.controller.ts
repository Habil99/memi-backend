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
  @ApiResponse({ status: 201, description: 'Chat created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createChat(
    @Request() req: { user: Express.User },
    @Body() createChatDto: CreateChatDto,
  ): Promise<IChat> {
    return this.chatService.createChat(req.user.id, createChatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user chats' })
  @ApiResponse({ status: 200, description: 'Chats retrieved successfully' })
  async getUserChats(
    @Request() req: { user: Express.User },
  ): Promise<IChat[]> {
    return this.chatService.getUserChats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chat by ID with messages' })
  @ApiResponse({ status: 200, description: 'Chat retrieved successfully' })
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
  @ApiResponse({ status: 200, description: 'Chat blocked successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async blockChat(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
  ): Promise<IChat> {
    return this.chatService.blockChat(id, req.user.id);
  }

  @Put(':id/unblock')
  @ApiOperation({ summary: 'Unblock a chat' })
  @ApiResponse({ status: 200, description: 'Chat unblocked successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async unblockChat(
    @Param('id') id: string,
    @Request() req: { user: Express.User },
  ): Promise<IChat> {
    return this.chatService.unblockChat(id, req.user.id);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async test(): Promise<{ message: string }> {
    return { message: 'Chat module is working' };
  }
}

