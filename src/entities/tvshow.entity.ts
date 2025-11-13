import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Genre, Episode } from '../common/types';

@Entity('tvshows')
export class TVShow {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-json')
  genres: Genre[];

  @Column('simple-json')
  episodes: Episode[];
}
