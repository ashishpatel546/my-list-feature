import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Genre } from '../common/types';

@Entity('movies')
export class Movie {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-json')
  genres: Genre[];

  @Column('datetime')
  releaseDate: Date;

  @Column()
  director: string;

  @Column('simple-json')
  actors: string[];
}
