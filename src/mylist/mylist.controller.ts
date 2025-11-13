import { Controller, Post, Delete, Get, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { MyListService } from './mylist.service';
import { AddToListDto } from './dto/add-to-list.dto';
import { RemoveFromListDto } from './dto/remove-from-list.dto';
import { ListMyItemsDto } from './dto/list-my-items.dto';

@ApiTags('mylist')
@Controller('mylist')
export class MyListController {
  constructor(private readonly myListService: MyListService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to My List',
    description: "Add a movie or TV show to the user's personal list. Prevents duplicate entries.",
  })
  @ApiBody({ type: AddToListDto })
  @ApiResponse({
    status: 201,
    description: 'Item successfully added to the list',
    schema: {
      example: {
        success: true,
        message: 'Item added to your list',
        data: {
          id: 'uuid-here',
          userId: 'user-1',
          contentId: 'movie-1',
          contentType: 'movie',
          createdAt: '2024-11-13T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Movie or TV show not found' })
  @ApiResponse({ status: 409, description: 'Item already exists in the list' })
  async addToList(@Body() addToListDto: AddToListDto) {
    const item = await this.myListService.addToList(addToListDto);
    return {
      success: true,
      message: 'Item added to your list',
      data: item,
    };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from My List',
    description: "Remove a movie or TV show from the user's personal list.",
  })
  @ApiBody({ type: RemoveFromListDto })
  @ApiResponse({
    status: 200,
    description: 'Item successfully removed from the list',
    schema: {
      example: {
        success: true,
        message: 'Item removed from your list',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Item not found in the list' })
  async removeFromList(@Body() removeFromListDto: RemoveFromListDto) {
    await this.myListService.removeFromList(removeFromListDto);
    return {
      success: true,
      message: 'Item removed from your list',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List My Items',
    description:
      "Retrieve all items in the user's list with pagination. Returns full content details for each item. Optimized with caching for <10ms response time.",
  })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID', example: 'user-1' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'List retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          items: [
            {
              id: 'uuid-here',
              contentId: 'movie-1',
              contentType: 'movie',
              addedAt: '2024-11-13T10:30:00.000Z',
              content: {
                id: 'movie-1',
                title: 'The Matrix',
                description: 'A computer hacker learns about the true nature of his reality.',
                genres: ['Action', 'SciFi'],
                releaseDate: '1999-03-31T00:00:00.000Z',
                director: 'Wachowski Brothers',
                actors: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
              },
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 25,
            totalPages: 2,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async listMyItems(@Query() listMyItemsDto: ListMyItemsDto) {
    const result = await this.myListService.listMyItems(listMyItemsDto);
    return {
      success: true,
      data: result,
    };
  }
}
