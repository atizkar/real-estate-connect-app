# --- STAGE 1: Build the React Application ---
FROM node:20 AS build-stage

# Declare build arguments that will receive values from 'docker build --build-arg'
ARG REACT_APP_FIREBASE_CONFIG
ARG REACT_APP_APP_ID
ARG REACT_APP_INITIAL_AUTH_TOKEN
ARG REACT_APP_GEMINI_API_KEY

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

# Install dependencies using npm ci for cleaner builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# --- DEEP DEBUGGING START ---
# This section will print environment variables during the Docker build.
# This helps confirm if build-args are correctly propagating.

# Debug 1: Confirm ARG values are received by Dockerfile and show the value (first 5 chars)
RUN echo "DEBUG (Dockerfile - ARG): REACT_APP_GEMINI_API_KEY ARG value: ${REACT_APP_GEMINI_API_KEY}" && \
    if [ -z "${REACT_APP_GEMINI_API_KEY}" ]; then echo "  -> ARG is empty!"; fi

# Generate .env.production file using the build arguments
# Use 'set -x' to show command execution
RUN set -x && \
    echo "REACT_APP_FIREBASE_CONFIG=${REACT_APP_FIREBASE_CONFIG}" > .env.production && \
    echo "REACT_APP_APP_ID=${REACT_APP_APP_ID}" >> .env.production && \
    echo "REACT_APP_INITIAL_AUTH_TOKEN=${REACT_APP_INITIAL_AUTH_TOKEN}" >> .env.production && \
    echo "REACT_APP_GEMINI_API_KEY=${REACT_APP_GEMINI_API_KEY}" >> .env.production

# Debug 2: Verify .env.production content
RUN echo "DEBUG (Dockerfile - .env.production content):" && \
    cat .env.production && \
    if ! grep -q "REACT_APP_GEMINI_API_KEY=" .env.production; then echo "  -> REACT_APP_GEMINI_API_KEY not found in .env.production!"; fi && \
    if grep -q "REACT_APP_GEMINI_API_KEY=" .env.production && [ -z "$(grep "REACT_APP_GEMINI_API_KEY=" .env.production | cut -d'=' -f2)" ]; then echo "  -> REACT_APP_GEMINI_API_KEY is empty in .env.production!"; fi


# Debug 3: Try to explicitly set environment variables for the build command
# and then run a test command to see what process.env contains
# This attempts to mimic how npm run build sees its environment.
RUN echo "DEBUG (Dockerfile - Pre-build env check):" && \
    export REACT_APP_FIREBASE_CONFIG="${REACT_APP_FIREBASE_CONFIG}" && \
    export REACT_APP_APP_ID="${REACT_APP_APP_ID}" && \
    export REACT_APP_INITIAL_AUTH_TOKEN="${REACT_APP_INITIAL_AUTH_TOKEN}" && \
    export REACT_APP_GEMINI_API_KEY="${REACT_APP_GEMINI_API_KEY}" && \
    node -e 'console.log("process.env.REACT_APP_GEMINI_API_KEY (node-e):", process.env.REACT_APP_GEMINI_API_KEY ? "SET" : "NOT SET");'

# --- DEEP DEBUGGING END ---

# Build the React application
# Create React App will automatically load .env.production for the build.
# This command should now see REACT_APP_GEMINI_API_KEY via .env.production or explicit export
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
