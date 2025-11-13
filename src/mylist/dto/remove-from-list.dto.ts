import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveFromListDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: 'user-1',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The ID of the movie or TV show to remove',
    example: 'movie-1',
  })
  @IsString()
  @IsNotEmpty()
  contentId: string;
}
