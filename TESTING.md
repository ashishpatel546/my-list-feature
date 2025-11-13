# Testing Checklist

Use this checklist to verify the My List API is working correctly.

## ✅ Pre-Testing Setup

- [ ] Dependencies installed (`npm install`)
- [ ] Database seeded (`npm run seed`)
- [ ] Server running (`npm run start:dev` or `docker-compose up -d`)
- [ ] Server accessible at http://localhost:3000

## ✅ Manual Testing

### Test 1: Get User's List (Empty or Existing)

```bash
curl "http://localhost:3000/mylist?userId=user-1"
```

**Expected**: JSON response with items array and pagination

---

### Test 2: Add Movie to List

```bash
curl -X POST http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentId":"movie-3","contentType":"movie"}'
```

**Expected**: 201 status, success message, item details

---

### Test 3: Verify Item Was Added

```bash
curl "http://localhost:3000/mylist?userId=user-2"
```

**Expected**: List includes the movie you just added

---

### Test 4: Add TV Show to List

```bash
curl -X POST http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentId":"tvshow-3","contentType":"tvshow"}'
```

**Expected**: 201 status, success message

---

### Test 5: Try Adding Duplicate (Should Fail)

```bash
curl -X POST http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentId":"movie-3","contentType":"movie"}'
```

**Expected**: 409 status, "Item already exists" error

---

### Test 6: Try Adding Non-Existent Content (Should Fail)

```bash
curl -X POST http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentId":"movie-999","contentType":"movie"}'
```

**Expected**: 404 status, "Movie not found" error

---

### Test 7: Test Pagination

```bash
curl "http://localhost:3000/mylist?userId=user-1&page=1&limit=2"
```

**Expected**: Only 2 items, pagination info shows total and pages

---

### Test 8: Remove Item from List

```bash
curl -X DELETE http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentId":"movie-3"}'
```

**Expected**: 200 status, "Item removed" message

---

### Test 9: Verify Item Was Removed

```bash
curl "http://localhost:3000/mylist?userId=user-2"
```

**Expected**: movie-3 is no longer in the list

---

### Test 10: Try Removing Non-Existent Item (Should Fail)

```bash
curl -X DELETE http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentId":"movie-999"}'
```

**Expected**: 404 status, "Item not found" error

---

### Test 11: Test Invalid Request (Missing Required Field)

```bash
curl -X POST http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentType":"movie"}'
```

**Expected**: 400 status, validation error about missing contentId

---

### Test 12: Test Invalid Content Type

```bash
curl -X POST http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-2","contentId":"movie-1","contentType":"invalid"}'
```

**Expected**: 400 status, validation error about invalid contentType

---

## ✅ Performance Testing

### Test 13: Response Time (First Request)

```bash
time curl "http://localhost:3000/mylist?userId=user-1"
```

**Expected**: Should complete in < 100ms

---

### Test 14: Response Time (Cached Request)

```bash
# Run twice in quick succession
curl "http://localhost:3000/mylist?userId=user-1" > /dev/null
time curl "http://localhost:3000/mylist?userId=user-1"
```

**Expected**: Second request should be < 10ms

---

### Test 15: Cache Invalidation

```bash
# 1. Get list (to populate cache)
curl "http://localhost:3000/mylist?userId=user-1"

# 2. Add item (should invalidate cache)
curl -X POST http://localhost:3000/mylist \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-1","contentId":"movie-7","contentType":"movie"}'

# 3. Get list again (should show new item)
curl "http://localhost:3000/mylist?userId=user-1"
```

**Expected**: Third request shows the newly added item

---

## ✅ Integration Tests

### Test 16: Run All Integration Tests

```bash
npm run test:e2e
```

**Expected**: All 22 tests pass

---

### Test 17: Run with Coverage

```bash
npm run test:cov
```

**Expected**: High coverage percentage (>80%)

---

## ✅ Docker Testing

### Test 18: Docker Build

```bash
docker-compose build
```

**Expected**: Image builds successfully without errors

---

### Test 19: Docker Start

```bash
docker-compose up -d
docker-compose ps
```

**Expected**: Container running and healthy

---

### Test 20: Docker API Test

```bash
# Wait a few seconds for startup
sleep 5
curl "http://localhost:3000/mylist?userId=user-1"
```

**Expected**: API responds correctly

---

### Test 21: Docker Logs

```bash
docker-compose logs
```

**Expected**: No errors, clean startup logs

---

### Test 22: Docker Seed

```bash
docker-compose exec mylist-api npm run seed
```

**Expected**: Database seeded successfully

---

### Test 23: Docker Stop

```bash
docker-compose down
```

**Expected**: Container stops cleanly

---

## ✅ Data Validation Tests

### Test 24: Verify Content Details in Response

```bash
curl "http://localhost:3000/mylist?userId=user-1" | jq
```

**Expected**:

- Each item has full content details (title, description, genres, etc.)
- Proper date formatting
- All required fields present

---

### Test 25: Verify Pagination Calculation

```bash
# Add 10 items to user-3
for i in {1..10}; do
  curl -X POST http://localhost:3000/mylist \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"user-3\",\"contentId\":\"movie-$i\",\"contentType\":\"movie\"}"
done

# Check pagination
curl "http://localhost:3000/mylist?userId=user-3&limit=3"
```

**Expected**:

- Shows 3 items
- Total shows 10
- Total pages shows 4

---

## ✅ Edge Cases

### Test 26: Page Beyond Available Data

```bash
curl "http://localhost:3000/mylist?userId=user-1&page=999&limit=10"
```

**Expected**: Empty items array, but valid response

---

### Test 27: Very Large Limit

```bash
curl "http://localhost:3000/mylist?userId=user-1&limit=1000"
```

**Expected**: Returns all items up to actual total

---

### Test 28: Negative Page Number

```bash
curl "http://localhost:3000/mylist?userId=user-1&page=-1"
```

**Expected**: 400 validation error

---

### Test 29: Invalid Data Types

```bash
curl "http://localhost:3000/mylist?userId=user-1&page=abc&limit=xyz"
```

**Expected**: 400 validation error

---

## ✅ Result Summary

Total Tests: 29

Passed: **_ / 29
Failed: _** / 29

---

## Troubleshooting

### If tests fail:

1. **Server not responding**
   - Check server is running: `docker-compose ps` or `ps aux | grep node`
   - Check port 3000 is not in use: `lsof -i :3000`

2. **404 Errors**
   - Verify database is seeded: `npm run seed`
   - Check content IDs match seed data

3. **Validation errors**
   - Check JSON syntax in curl commands
   - Verify all required fields are present
   - Check contentType is "movie" or "tvshow"

4. **Performance issues**
   - First request is slower (20-50ms) - this is normal
   - Check cache is enabled in .env
   - Verify no other heavy processes running

5. **Docker issues**
   - Rebuild image: `docker-compose build --no-cache`
   - Check logs: `docker-compose logs -f`
   - Verify .env file exists

---

## Quick Test Script

Save this as `test-all.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

test_endpoint() {
    echo "Testing: $1"
    if $2; then
        echo "✅ PASSED"
        ((PASSED++))
    else
        echo "❌ FAILED"
        ((FAILED++))
    fi
    echo ""
}

# Test 1: Get list
test_endpoint "Get user list" \
    "curl -s \"$BASE_URL/mylist?userId=user-1\" | grep -q success"

# Test 2: Add item
test_endpoint "Add movie" \
    "curl -s -X POST \"$BASE_URL/mylist\" -H 'Content-Type: application/json' -d '{\"userId\":\"user-test\",\"contentId\":\"movie-1\",\"contentType\":\"movie\"}' | grep -q success"

# Test 3: Remove item
test_endpoint "Remove movie" \
    "curl -s -X DELETE \"$BASE_URL/mylist\" -H 'Content-Type: application/json' -d '{\"userId\":\"user-test\",\"contentId\":\"movie-1\"}' | grep -q success"

echo "Results: $PASSED passed, $FAILED failed"
```

Run with: `chmod +x test-all.sh && ./test-all.sh`

---

## API Testing Tools

You can also use:

- **Postman**: Import `api-collection.json`
- **Insomnia**: Import `api-collection.json`
- **HTTPie**: `http GET localhost:3000/mylist userId==user-1`
- **Browser**: Just visit `http://localhost:3000/mylist?userId=user-1`

---

**Happy Testing! 🚀**
