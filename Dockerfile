# --- STAGE 1: Build the React Application ---
# Changed base image from node:20-alpine to full node:20 (Debian-based)
FROM node:20 AS build-stage

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

# Install dependencies using npm ci for cleaner builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the React application
# 'npm run build' should now work as expected in the more complete Node.js environment
RUN npm run build

# --- STAGE 2: Serve the Application with Nginx ---
# We can keep nginx:stable-alpine as it's efficient for serving static files
FROM nginx:stable-alpine AS production-stage

# Copy Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy the built React app from the build-stage to Nginx's serving directory
COPY --from=build-stage /app/build /usr/share/nginx/html

# Expose port 80 for web traffic
EXPOSE 80

# Command to start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]