FROM node:22-alpine AS base
WORKDIR /app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Dev target
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 8001 9229
CMD ["npm", "run", "dev"]

# Production target
FROM base AS production
COPY . .
RUN npm run build
EXPOSE 8001
CMD ["node", "dist/index.js"]