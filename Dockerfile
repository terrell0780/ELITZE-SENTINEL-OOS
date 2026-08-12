FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN rm -rf .next && npm run build

EXPOSE 3001

CMD ["npm", "run", "start", "--", "-p", "3001"]
