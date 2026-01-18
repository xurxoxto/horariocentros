# Deployment Guide

This guide covers deploying HorarioCentros to production.

## Prerequisites

- Node.js 18+
- PostgreSQL (or SQLite for testing)
- Domain name (optional)
- SSL certificate (recommended)

## Environment Setup

### Server Environment Variables

Create `server/.env` with:

```env
PORT=3000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
JWT_SECRET=your-secure-random-string-here
DATABASE_URL=postgresql://user:password@localhost:5432/horariocentros
```

### Client Environment Variables

Create `client/.env` with:

```env
VITE_API_URL=https://yourdomain.com/api
VITE_SOCKET_URL=https://yourdomain.com
```

## Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

This creates:
- `server/dist/` - Compiled server code
- `client/dist/` - Optimized client bundle

## Deployment Options

### Option 1: Traditional Server (VPS/Dedicated)

1. **Upload files to server**
```bash
rsync -avz --exclude node_modules . user@yourserver:/var/www/horariocentros
```

2. **Install dependencies on server**
```bash
ssh user@yourserver
cd /var/www/horariocentros
npm install --production
```

3. **Set up process manager (PM2)**
```bash
npm install -g pm2
pm2 start server/dist/index.js --name horariocentros
pm2 save
pm2 startup
```

4. **Configure Nginx reverse proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Serve static files
    location / {
        root /var/www/horariocentros/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Option 2: Docker

1. **Create Dockerfile**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

2. **Build and run**
```bash
docker build -t horariocentros .
docker run -d -p 3000:3000 --env-file .env horariocentros
```

### Option 3: Cloud Platforms

#### Heroku

```bash
# Install Heroku CLI
heroku login
heroku create horariocentros

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

#### Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
cd client
vercel
```

**Backend (Railway):**
1. Connect GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm start`
3. Set environment variables
4. Deploy

## Database Setup

### PostgreSQL

```bash
# Create database
createdb horariocentros

# Run migrations (if using Prisma or similar)
npx prisma migrate deploy
```

### SQLite (Development)

SQLite database is created automatically in the specified location.

## SSL/TLS Setup

### Let's Encrypt (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs horariocentros

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Health Check Endpoint

Monitor `/api/health` for application health:

```bash
curl https://yourdomain.com/api/health
```

## Backups

### Database Backups

```bash
# PostgreSQL
pg_dump horariocentros > backup_$(date +%Y%m%d).sql

# Automate with cron
0 2 * * * pg_dump horariocentros > /backups/horariocentros_$(date +\%Y\%m\%d).sql
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Permission errors**
   ```bash
   sudo chown -R $USER:$USER /var/www/horariocentros
   ```

3. **WebSocket connection fails**
   - Check Nginx/proxy configuration
   - Ensure proper headers for WebSocket upgrade

## Performance Optimization

1. **Enable gzip compression** in Nginx
2. **Set up CDN** for static assets
3. **Configure caching** headers
4. **Use connection pooling** for database
5. **Monitor and optimize** database queries

## Security Checklist

- [ ] Strong JWT secret set
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials protected
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular security updates
- [ ] Firewall configured
- [ ] Backups automated

## Support

For deployment issues, open an issue on GitHub or contact support.
