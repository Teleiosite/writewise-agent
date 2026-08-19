# ─── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build args for environment variables (injected at build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STATS_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_STATS_API_URL=$VITE_STATS_API_URL

RUN npm run build

# ─── Stage 2: Node.js API Server ─────────────────────────────────────────────
FROM node:20-alpine AS api-server

WORKDIR /api

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy only the API handlers + tsconfig
COPY api/ ./api/
COPY tsconfig.json tsconfig.node.json ./

# Install ts-node for running TypeScript directly
RUN npm install -g ts-node typescript

# Copy built frontend static files to serve
COPY --from=frontend-builder /app/dist /var/www/writewise

# Copy the Node API server entrypoint
COPY server.js ./server.js

EXPOSE 3001

CMD ["node", "server.js"]

# ─── Final: Nginx serves static files, proxies /api and /stats ───────────────
# (Nginx container defined in docker-compose.yml)
