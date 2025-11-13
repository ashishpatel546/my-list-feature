import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Movie } from '../entities/movie.entity';
import { TVShow } from '../entities/tvshow.entity';
import { MyListItem } from '../entities/mylist.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'mylist.db',
  entities: [User, Movie, TVShow, MyListItem],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Database initialized');

  const userRepository = AppDataSource.getRepository(User);
  const movieRepository = AppDataSource.getRepository(Movie);
  const tvShowRepository = AppDataSource.getRepository(TVShow);
  const myListRepository = AppDataSource.getRepository(MyListItem);

  // Clear existing data
  await myListRepository.clear();
  await userRepository.clear();
  await movieRepository.clear();
  await tvShowRepository.clear();

  console.log('Creating users...');
  const users = [
    {
      id: 'user-1',
      username: 'john_doe',
      preferences: {
        favoriteGenres: ['Action', 'SciFi'] as any,
        dislikedGenres: ['Horror'] as any,
      },
      watchHistory: [
        {
          contentId: 'movie-1',
          watchedOn: new Date('2024-01-15'),
          rating: 5,
        },
      ] as any,
    },
    {
      id: 'user-2',
      username: 'jane_smith',
      preferences: {
        favoriteGenres: ['Romance', 'Comedy'] as any,
        dislikedGenres: ['Horror', 'SciFi'] as any,
      },
      watchHistory: [] as any,
    },
    {
      id: 'user-3',
      username: 'alex_jones',
      preferences: {
        favoriteGenres: ['Drama', 'Fantasy'] as any,
        dislikedGenres: [] as any,
      },
      watchHistory: [] as any,
    },
  ];

  await userRepository.save(users as any);
  console.log(`Created ${users.length} users`);

  console.log('Creating movies...');
  const movies = [
    {
      id: 'movie-1',
      title: 'The Matrix',
      description: 'A computer hacker learns about the true nature of his reality.',
      genres: ['Action', 'SciFi'],
      releaseDate: new Date('1999-03-31'),
      director: 'Wachowski Brothers',
      actors: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    },
    {
      id: 'movie-2',
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology.',
      genres: ['Action', 'SciFi'],
      releaseDate: new Date('2010-07-16'),
      director: 'Christopher Nolan',
      actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
    },
    {
      id: 'movie-3',
      title: 'The Shawshank Redemption',
      description:
        'Two imprisoned men bond over years, finding redemption through acts of decency.',
      genres: ['Drama'],
      releaseDate: new Date('1994-09-23'),
      director: 'Frank Darabont',
      actors: ['Tim Robbins', 'Morgan Freeman'],
    },
    {
      id: 'movie-4',
      title: 'Pulp Fiction',
      description: 'Various interconnected stories of Los Angeles criminals.',
      genres: ['Drama', 'Action'],
      releaseDate: new Date('1994-10-14'),
      director: 'Quentin Tarantino',
      actors: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    },
    {
      id: 'movie-5',
      title: 'The Dark Knight',
      description:
        'Batman faces the Joker, a criminal mastermind who wants to plunge Gotham into anarchy.',
      genres: ['Action', 'Drama'],
      releaseDate: new Date('2008-07-18'),
      director: 'Christopher Nolan',
      actors: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    },
    {
      id: 'movie-6',
      title: 'Forrest Gump',
      description:
        'The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man.',
      genres: ['Drama', 'Romance'],
      releaseDate: new Date('1994-07-06'),
      director: 'Robert Zemeckis',
      actors: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    },
    {
      id: 'movie-7',
      title: 'The Hangover',
      description:
        'Three friends wake up from a bachelor party in Las Vegas with no memory of the previous night.',
      genres: ['Comedy'],
      releaseDate: new Date('2009-06-05'),
      director: 'Todd Phillips',
      actors: ['Bradley Cooper', 'Ed Helms', 'Zach Galifianakis'],
    },
    {
      id: 'movie-8',
      title: 'The Conjuring',
      description: 'Paranormal investigators work to help a family terrorized by a dark presence.',
      genres: ['Horror'],
      releaseDate: new Date('2013-07-19'),
      director: 'James Wan',
      actors: ['Patrick Wilson', 'Vera Farmiga', 'Lili Taylor'],
    },
  ];

  await movieRepository.save(movies as any);
  console.log(`Created ${movies.length} movies`);

  console.log('Creating TV shows...');
  const tvShows = [
    {
      id: 'tvshow-1',
      title: 'Breaking Bad',
      description: 'A high school chemistry teacher turned methamphetamine producer.',
      genres: ['Drama', 'Action'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2008-01-20'),
          director: 'Vince Gilligan',
          actors: ['Bryan Cranston', 'Aaron Paul'],
        },
        {
          episodeNumber: 2,
          seasonNumber: 1,
          releaseDate: new Date('2008-01-27'),
          director: 'Vince Gilligan',
          actors: ['Bryan Cranston', 'Aaron Paul'],
        },
      ],
    },
    {
      id: 'tvshow-2',
      title: 'Game of Thrones',
      description: 'Nine noble families fight for control over the lands of Westeros.',
      genres: ['Fantasy', 'Drama', 'Action'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2011-04-17'),
          director: 'Tim Van Patten',
          actors: ['Emilia Clarke', 'Peter Dinklage', 'Kit Harington'],
        },
      ],
    },
    {
      id: 'tvshow-3',
      title: 'Friends',
      description:
        'Follows the personal and professional lives of six friends living in Manhattan.',
      genres: ['Comedy', 'Romance'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('1994-09-22'),
          director: 'James Burrows',
          actors: ['Jennifer Aniston', 'Courteney Cox', 'Lisa Kudrow'],
        },
      ],
    },
    {
      id: 'tvshow-4',
      title: 'Stranger Things',
      description:
        'A young boy disappears and strange supernatural events begin to occur in a small town.',
      genres: ['SciFi', 'Horror', 'Drama'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2016-07-15'),
          director: 'Duffer Brothers',
          actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
        },
      ],
    },
    {
      id: 'tvshow-5',
      title: 'The Office',
      description: 'A mockumentary on a group of typical office workers.',
      genres: ['Comedy'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2005-03-24'),
          director: 'Greg Daniels',
          actors: ['Steve Carell', 'Rainn Wilson', 'John Krasinski'],
        },
      ],
    },
  ];

  await tvShowRepository.save(tvShows as any);
  console.log(`Created ${tvShows.length} TV shows`);

  console.log('Creating sample My List items...');
  const myListItems = [
    {
      userId: 'user-1',
      contentId: 'movie-1',
      contentType: 'movie' as const,
    },
    {
      userId: 'user-1',
      contentId: 'movie-2',
      contentType: 'movie' as const,
    },
    {
      userId: 'user-1',
      contentId: 'tvshow-1',
      contentType: 'tvshow' as const,
    },
    {
      userId: 'user-2',
      contentId: 'movie-6',
      contentType: 'movie' as const,
    },
    {
      userId: 'user-2',
      contentId: 'tvshow-3',
      contentType: 'tvshow' as const,
    },
  ];

  await myListRepository.save(myListItems);
  console.log(`Created ${myListItems.length} My List items`);

  console.log('Seed completed successfully!');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
