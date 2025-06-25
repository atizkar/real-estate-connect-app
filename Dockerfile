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

# --- DEBUGGING START (keeping some relevant ones) ---
# Debug 1: Confirm ARG values are received by Dockerfile and show the value (first 5 chars)
RUN echo "DEBUG (Dockerfile - ARG): REACT_APP_GEMINI_API_KEY ARG value: ${REACT_APP_GEMINI_API_KEY}" && \
    if [ -z "${REACT_APP_GEMINI_API_KEY}" ]; then echo "  -> ARG is empty!"; fi

# Debug 2: Directly check process.env before npm run build, ensuring it's set in this shell
RUN echo "DEBUG (Dockerfile - Pre-build env check - direct export):" && \
    export REACT_APP_GEMINI_API_KEY="${REACT_APP_GEMINI_API_KEY}" && \
    node -e 'console.log("process.env.REACT_APP_GEMINI_API_KEY (node-e, explicit export):", process.env.REACT_APP_GEMINI_API_KEY ? "SET" : "NOT SET");'

# --- DEBUGGING END ---

# Build the React application
# This is the most direct and often most reliable way to pass env vars to create-react-app.
# Prefixing the 'npm run build' command with the env vars ensures they are available
# to the 'react-scripts build' process.
RUN REACT_APP_FIREBASE_CONFIG=$REACT_APP_FIREBASE_CONFIG \
    REACT_APP_APP_ID=$REACT_APP_APP_ID \
    REACT_APP_INITIAL_AUTH_TOKEN=$REACT_APP_INITIAL_AUTH_TOKEN \
    REACT_APP_GEMINI_API_KEY=$REACT_APP_GEMINI_API_KEY \
    npm run build

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
