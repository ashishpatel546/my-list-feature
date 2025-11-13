import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

export type ContentType = 'movie' | 'tvshow';

@Entity('my_list')
@Unique(['userId', 'contentId'])
@Index(['userId', 'createdAt'])
export class MyListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  contentId: string;

  @Column()
  contentType: ContentType;

  @CreateDateColumn()
  createdAt: Date;
}
