# Build stage
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code and build
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy build files to NGINX web root
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80