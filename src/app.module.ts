import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { MyListModule } from './mylist/mylist.module';
import { User } from './entities/user.entity';
import { Movie } from './entities/movie.entity';
import { TVShow } from './entities/tvshow.entity';
import { MyListItem } from './entities/mylist.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get('DB_DATABASE', 'mylist.db'),
        entities: [User, Movie, TVShow, MyListItem],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 60 seconds
      max: 1000, // maximum number of items in cache
    }),
    MyListModule,
  ],
})
export class AppModule {}
