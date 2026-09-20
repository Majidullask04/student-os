# Multi-stage production Dockerfile for Student OS Frontend
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci || npm install

COPY . .

ARG VITE_API_URL=http://localhost:8000
ARG VITE_SUPABASE_URL=https://rfdvrynwzmghxovikukk.supabase.co
ARG VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_E2ZOLFfvDod-OQ1zhe421w_QNKT_akn

ENV VITE_API_URL=$VITE_API_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# Production server stage with Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Custom SPA fallback config
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:8000/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
