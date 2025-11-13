import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MyListItem } from '../entities/mylist.entity';
import { Movie } from '../entities/movie.entity';
import { TVShow } from '../entities/tvshow.entity';
import { AddToListDto } from './dto/add-to-list.dto';
import { RemoveFromListDto } from './dto/remove-from-list.dto';
import { ListMyItemsDto } from './dto/list-my-items.dto';

@Injectable()
export class MyListService {
  constructor(
    @InjectRepository(MyListItem)
    private myListRepository: Repository<MyListItem>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(TVShow)
    private tvShowRepository: Repository<TVShow>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async addToList(addToListDto: AddToListDto): Promise<MyListItem> {
    const { userId, contentId, contentType } = addToListDto;

    // Verify content exists
    if (contentType === 'movie') {
      const movie = await this.movieRepository.findOne({ where: { id: contentId } });
      if (!movie) {
        throw new NotFoundException(`Movie with id ${contentId} not found`);
      }
    } else {
      const tvshow = await this.tvShowRepository.findOne({ where: { id: contentId } });
      if (!tvshow) {
        throw new NotFoundException(`TV Show with id ${contentId} not found`);
      }
    }

    // Check for duplicates
    const existing = await this.myListRepository.findOne({
      where: { userId, contentId },
    });

    if (existing) {
      throw new ConflictException('Item already exists in your list');
    }

    // Add to list
    const item = this.myListRepository.create({
      userId,
      contentId,
      contentType,
    });

    const saved = await this.myListRepository.save(item);

    // Invalidate cache for this user
    await this.invalidateUserCache(userId);

    return saved;
  }

  async removeFromList(removeFromListDto: RemoveFromListDto): Promise<void> {
    const { userId, contentId } = removeFromListDto;

    const item = await this.myListRepository.findOne({
      where: { userId, contentId },
    });

    if (!item) {
      throw new NotFoundException('Item not found in your list');
    }

    await this.myListRepository.remove(item);

    // Invalidate cache for this user
    await this.invalidateUserCache(userId);
  }

  async listMyItems(listMyItemsDto: ListMyItemsDto) {
    const { userId, page = 1, limit = 20 } = listMyItemsDto;
    const cacheKey = `mylist:${userId}:${page}:${limit}`;

    // Try to get from cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // If not in cache, query database
    const skip = (page - 1) * limit;

    const [items, total] = await this.myListRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Fetch full content details
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        let content;
        if (item.contentType === 'movie') {
          content = await this.movieRepository.findOne({ where: { id: item.contentId } });
        } else {
          content = await this.tvShowRepository.findOne({ where: { id: item.contentId } });
        }

        return {
          id: item.id,
          contentId: item.contentId,
          contentType: item.contentType,
          addedAt: item.createdAt,
          content,
        };
      }),
    );

    const result = {
      items: enrichedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result
    await this.cacheManager.set(cacheKey, result, 60000); // 60 seconds TTL

    return result;
  }

  private async invalidateUserCache(userId: string): Promise<void> {
    // Simple cache invalidation - in production, use a more sophisticated pattern
    const keys = await this.cacheManager.store.keys();
    const userKeys = keys.filter((key: string) => key.startsWith(`mylist:${userId}:`));
    await Promise.all(userKeys.map((key: string) => this.cacheManager.del(key)));
  }
}
