# ---- Stage 1: Build the app ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
# COPY tsconfig.json vite.config.ts ./
RUN npm install

# Copy source code
COPY . .

# EXPOSE 5173
# CMD ["npm", "run", "dev"]

# Build for production
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine

RUN apk add --no-cache gettext

WORKDIR /usr/share/nginx/html

# Copy build output to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Entry script to substitute env vars into config before starting nginx
CMD envsubst '${VITE_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# # Replace default Nginx config to handle React Router
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]