# --- STAGE 1: Build the React Application ---
FROM node:20 AS build-stage

# Declare build arguments that will receive values from 'docker build --build-arg'
ARG REACT_APP_FIREBASE_CONFIG
ARG REACT_APP_APP_ID
ARG REACT_APP_INITIAL_AUTH_TOKEN
# Removed ARG REACT_APP_GEMINI_API_KEY as it's not needed for LLM Studio

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

# Install dependencies using npm ci for cleaner builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# --- ENVIRONMENT VARIABLE INJECTION ---
# Create a .env file directly using the ARG values.
# Only include necessary variables for Firebase.
RUN echo "REACT_APP_FIREBASE_CONFIG=${REACT_APP_FIREBASE_CONFIG}" > .env && \
    echo "REACT_APP_APP_ID=${REACT_APP_APP_ID}" >> .env && \
    echo "REACT_APP_INITIAL_AUTH_TOKEN=${REACT_APP_INITIAL_AUTH_TOKEN}" >> .env
# Removed REACT_APP_GEMINI_API_KEY from .env creation

# --- DEBUGGING START (confirming .env content) ---
RUN echo "DEBUG (Dockerfile - .env content before build):" && \
    cat .env
# --- DEBUGGING END ---


# Build the React application
RUN npm run build

# --- STAGE 2: Serve the Application with Nginx ---
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
