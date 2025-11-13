import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToListDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: 'user-1',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The ID of the movie or TV show',
    example: 'movie-1',
  })
  @IsString()
  @IsNotEmpty()
  contentId: string;

  @ApiProperty({
    description: 'The type of content (movie or tvshow)',
    enum: ['movie', 'tvshow'],
    example: 'movie',
  })
  @IsEnum(['movie', 'tvshow'])
  contentType: 'movie' | 'tvshow';
}
