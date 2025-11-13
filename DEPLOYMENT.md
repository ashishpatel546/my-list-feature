# Deployment Guide

This guide covers various deployment options for the My List API.

## Prerequisites

- Docker and docker-compose installed
- Git repository set up
- CI/CD pipeline configured (GitHub Actions included)

## Deployment Options

### 1. Docker Compose (Simple Deployment)

Best for: Small deployments, testing, single-server setups

```bash
# On your server
git clone <your-repo>
cd mylist_assignment

# Copy and configure environment
cp .env.example .env
# Edit .env with production values

# Start the service
docker-compose up -d

# Seed database
docker-compose exec mylist-api npm run seed

# Check status
docker-compose ps
docker-compose logs -f
```

**Pros**: Simple, quick setup
**Cons**: Not highly available, single point of failure

### 2. AWS Deployment

#### Option A: AWS ECS (Elastic Container Service)

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t mylist-api .
docker tag mylist-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/mylist-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/mylist-api:latest

# Create ECS task definition and service
# Use RDS for database instead of SQLite
# Use ElastiCache Redis for caching
```

#### Option B: AWS Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p docker mylist-api

# Create environment
eb create mylist-production

# Deploy
eb deploy
```

**Database**: Use RDS PostgreSQL or MongoDB Atlas
**Caching**: Use ElastiCache Redis
**Cost**: ~$50-200/month depending on traffic

### 3. Google Cloud Platform (GCP)

#### Cloud Run (Serverless)

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/mylist-api

# Deploy to Cloud Run
gcloud run deploy mylist-api \
  --image gcr.io/PROJECT-ID/mylist-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SERVICE_PORT=8080
```

**Database**: Use Cloud SQL PostgreSQL
**Caching**: Use Memorystore Redis
**Cost**: Pay per request (very cost-effective for low traffic)

### 4. Azure

#### Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name mylist-rg --location eastus

# Create container
az container create \
  --resource-group mylist-rg \
  --name mylist-api \
  --image <your-docker-hub>/mylist-api:latest \
  --dns-name-label mylist-api \
  --ports 3000 \
  --environment-variables SERVICE_PORT=3000
```

**Database**: Use Azure Database for PostgreSQL
**Caching**: Use Azure Cache for Redis
**Cost**: ~$30-100/month

### 5. Kubernetes (Production Grade)

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mylist-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mylist-api
  template:
    metadata:
      labels:
        app: mylist-api
    spec:
      containers:
        - name: mylist-api
          image: your-registry/mylist-api:latest
          ports:
            - containerPort: 3000
          env:
            - name: SERVICE_PORT
              value: '3000'
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: host
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
---
apiVersion: v1
kind: Service
metadata:
  name: mylist-api
spec:
  selector:
    app: mylist-api
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

Deploy:

```bash
kubectl apply -f k8s/deployment.yaml
```

**Best for**: High traffic, need scaling, high availability
**Database**: External PostgreSQL or MongoDB cluster
**Caching**: Redis cluster

### 6. Heroku (Easiest)

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login

# Create app
heroku create mylist-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Deploy
git push heroku main

# Seed database
heroku run npm run seed
```

**Pros**: Very easy, managed database and Redis included
**Cons**: More expensive, less control
**Cost**: ~$7-25/month for hobby tier

## Production Considerations

### 1. Database Migration from SQLite

For production, migrate to PostgreSQL:

Update `app.module.ts`:

```typescript
TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [User, Movie, TVShow, MyListItem],
    synchronize: false, // Always false in production
    ssl: { rejectUnauthorized: false },
  }),
  inject: [ConfigService],
}),
```

Update `.env`:

```
DB_TYPE=postgres
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=mylist_user
DB_PASSWORD=secure_password
DB_DATABASE=mylist_db
```

### 2. Caching with Redis

Update `app.module.ts`:

```typescript
import * as redisStore from 'cache-manager-redis-store';

CacheModule.register({
  isGlobal: true,
  store: redisStore,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  ttl: 60,
}),
```

### 3. Environment Variables

Production `.env`:

```
NODE_ENV=production
SERVICE_PORT=3000

# Database
DB_TYPE=postgres
DB_HOST=prod-db.example.com
DB_PORT=5432
DB_USERNAME=mylist_prod
DB_PASSWORD=<secure-password>
DB_DATABASE=mylist_production

# Redis
REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=<secure-password>

# Caching
CACHE_TTL=60000
CACHE_MAX_ITEMS=10000

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
```

### 4. Security Checklist

- [ ] Use HTTPS only (SSL/TLS certificates)
- [ ] Enable CORS with specific origins (not \*)
- [ ] Implement rate limiting
- [ ] Add authentication/authorization
- [ ] Use environment variables for secrets
- [ ] Enable SQL injection protection (TypeORM does this)
- [ ] Add request validation (already implemented)
- [ ] Set up monitoring and alerts
- [ ] Enable logging (Winston, Pino)
- [ ] Use helmet.js for security headers

### 5. Monitoring Setup

Add to `main.ts`:

```typescript
import * as Sentry from '@sentry/node';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### 6. Logging

Install:

```bash
npm install winston
```

Create `src/logger/logger.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }
}
```

## CI/CD Pipeline

The included GitHub Actions workflow (`.github/workflows/ci-cd.yml`) provides:

1. **Continuous Integration**:
   - Runs on every push/PR
   - Tests on Node 18 and 20
   - Linting and formatting checks
   - Unit and integration tests
   - Coverage reporting

2. **Docker Build**:
   - Builds Docker image
   - Caches layers for faster builds
   - Tests the image

3. **Deployment** (uncomment to enable):
   - Deploys to production on main branch
   - Can be configured for any platform

## Performance Optimization for Production

### 1. Enable Clustering

Update `main.ts`:

```typescript
import * as cluster from 'cluster';
import * as os from 'os';

if (cluster.isMaster) {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
} else {
  bootstrap();
}
```

### 2. Add Compression

```bash
npm install compression
```

In `main.ts`:

```typescript
import * as compression from 'compression';
app.use(compression());
```

### 3. Database Connection Pooling

```typescript
TypeOrmModule.forRoot({
  // ... other config
  extra: {
    max: 20, // maximum pool size
    min: 5,  // minimum pool size
  },
}),
```

### 4. Rate Limiting

```bash
npm install @nestjs/throttler
```

In `app.module.ts`:

```typescript
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100, // 100 requests per minute
}),
```

## Scaling Strategy

### Horizontal Scaling

- Run multiple instances behind a load balancer
- Use Redis for shared caching
- Use managed database (RDS, Cloud SQL, etc.)

### Vertical Scaling

- Increase container CPU/memory
- Optimize database queries
- Add database read replicas

### Auto-scaling Rules

- Scale up when CPU > 70%
- Scale down when CPU < 30%
- Min instances: 2
- Max instances: 10

## Cost Estimates

### Small Scale (< 1000 users)

- Heroku Hobby: $7/month
- Digital Ocean App Platform: $12/month

### Medium Scale (< 100k users)

- AWS (ECS + RDS + ElastiCache): $100-300/month
- GCP (Cloud Run + Cloud SQL + Redis): $80-250/month

### Large Scale (> 1M users)

- Kubernetes cluster: $500-2000/month
- Managed services: $1000-5000/month

## Support

For deployment issues:

1. Check logs: `docker-compose logs -f` or `kubectl logs`
2. Verify environment variables
3. Test database connectivity
4. Check Redis connection
5. Review security groups/firewall rules

## Additional Resources

- [NestJS Deployment Guide](https://docs.nestjs.com/faq/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)
