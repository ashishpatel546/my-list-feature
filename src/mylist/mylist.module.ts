import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MyListController } from './mylist.controller';
import { MyListService } from './mylist.service';
import { MyListItem } from '../entities/mylist.entity';
import { Movie } from '../entities/movie.entity';
import { TVShow } from '../entities/tvshow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MyListItem, Movie, TVShow])],
  controllers: [MyListController],
  providers: [MyListService],
})
export class MyListModule {}
