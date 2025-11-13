import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Genre, Preferences, WatchHistoryItem } from '../common/types';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  username: string;

  @Column('simple-json')
  preferences: Preferences;

  @Column('simple-json')
  watchHistory: WatchHistoryItem[];
}
