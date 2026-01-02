import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Chat ID',
  })
  @IsUUID()
  chatId: string;

  @ApiProperty({
    example: 'Hello, is this item still available?',
    description: 'Message content',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  content: string;
}
