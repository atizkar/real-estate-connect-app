# --- STAGE 1: Build the React Application ---
FROM node:20 AS build-stage

# Declare build arguments that will receive values from 'docker build --build-arg'
# These ARG instructions allow Docker to receive the values from the `build-args` in ci-cd.yml.
ARG REACT_APP_FIREBASE_CONFIG
ARG REACT_APP_APP_ID
ARG REACT_APP_INITIAL_AUTH_TOKEN
ARG REACT_APP_GEMINI_API_KEY # Declare ARG for Gemini API Key

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

# Install dependencies using npm ci for cleaner builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate .env.production file using the build arguments
# This is the MOST reliable way for Create React App to pick up build-time environment variables.
# We explicitly write the REACT_APP_ variables into a .env.production file.
RUN echo "REACT_APP_FIREBASE_CONFIG=${REACT_APP_FIREBASE_CONFIG}" > .env.production && \
    echo "REACT_APP_APP_ID=${REACT_APP_APP_ID}" >> .env.production && \
    echo "REACT_APP_INITIAL_AUTH_TOKEN=${REACT_APP_INITIAL_AUTH_TOKEN}" >> .env.production && \
    echo "REACT_APP_GEMINI_API_KEY=${REACT_APP_GEMINI_API_KEY}" >> .env.production

# Build the React application
# Create React App will automatically load .env.production for the build.
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
