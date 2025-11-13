# Quick Start Guide

This guide will help you get the My List API up and running in under 5 minutes.

## Option 1: Local Development (Recommended for testing)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Seed Database

```bash
npm run seed
```

This creates:

- 3 users (user-1, user-2, user-3)
- 8 movies (movie-1 through movie-8)
- 5 TV shows (tvshow-1 through tvshow-5)
- Sample list items

### Step 3: Start Server

```bash
npm run start:dev
```

The API is now running at `http://localhost:3000`

### Step 4: Test the API

**Get a user's list:**

```bash
curl "http://localhost:3000/mylist?userId=user-1"
```

**Add a movie:**

```bash
curl -X POST http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentId":"movie-3","contentType":"movie"}'
```

**Remove an item:**

```bash
curl -X DELETE http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-1","contentId":"movie-1"}'
```

## Option 2: Docker (Recommended for deployment)

### Step 1: Start with Docker

```bash
docker-compose up -d
```

### Step 2: Seed Database

```bash
docker-compose exec mylist-api npm run seed
```

### Step 3: Test

```bash
curl "http://localhost:3000/mylist?userId=user-1"
```

### View Logs

```bash
docker-compose logs -f
```

### Stop

```bash
docker-compose down
```

## Running Tests

### Integration Tests

```bash
npm run test:e2e
```

### All Tests with Coverage

```bash
npm run test:cov
```

## Sample Data Reference

### Users

- `user-1` (john_doe) - Likes Action & SciFi
- `user-2` (jane_smith) - Likes Romance & Comedy
- `user-3` (alex_jones) - Likes Drama & Fantasy

### Movies

- `movie-1` - The Matrix (Action, SciFi)
- `movie-2` - Inception (Action, SciFi)
- `movie-3` - The Shawshank Redemption (Drama)
- `movie-4` - Pulp Fiction (Drama, Action)
- `movie-5` - The Dark Knight (Action, Drama)
- `movie-6` - Forrest Gump (Drama, Romance)
- `movie-7` - The Hangover (Comedy)
- `movie-8` - The Conjuring (Horror)

### TV Shows

- `tvshow-1` - Breaking Bad (Drama, Action)
- `tvshow-2` - Game of Thrones (Fantasy, Drama, Action)
- `tvshow-3` - Friends (Comedy, Romance)
- `tvshow-4` - Stranger Things (SciFi, Horror, Drama)
- `tvshow-5` - The Office (Comedy)

## Common Issues

### Port already in use

If port 3000 is busy, change it in `.env`:

```
SERVICE_PORT=3001
```

### Database locked

Stop the server and delete `mylist.db`, then reseed:

```bash
rm mylist.db
npm run seed
```

### Dependencies issues

Clear and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Check out the [API Collection](api-collection.json) for Postman/Insomnia
3. Review the integration tests in `test/mylist.e2e-spec.ts` for more examples
4. Explore the code structure in `src/`

## Need Help?

- Check the API returns in your terminal/logs
- Review error messages - they're descriptive
- Ensure the database is seeded before testing
- Verify the server is running before making requests

## Performance Note

The first request to list items might take 20-50ms. Subsequent requests are cached and return in 1-5ms (target: <10ms achieved!).
