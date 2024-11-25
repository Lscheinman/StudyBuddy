# Stage 1: Build the React app
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY .env ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . ./

# Build the React app
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:1.23
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates from the host
COPY /etc/letsencrypt/live/yourdomain.com/fullchain.pem /etc/nginx/ssl/fullchain.pem
COPY /etc/letsencrypt/live/yourdomain.com/privkey.pem /etc/nginx/ssl/privkey.pem

# Expose port 80
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
