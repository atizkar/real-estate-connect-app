# laravel_backend/Dockerfile
# Use a PHP-FPM base image for serving PHP applications (Laravel)
FROM php:8.2-fpm-alpine

# Set working directory inside the container
WORKDIR /var/www/html

# Install system dependencies required for PHP extensions and Composer
RUN apk add --no-cache \
    nginx \
    mysql-client \
    curl \
    git \
    build-base \
    autoconf \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    sqlite-dev \
    postgresql-dev \
    && rm -rf /var/cache/apk/* \
    && docker-php-ext-install pdo pdo_mysql opcache gd exif

# Install Composer globally in the container
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# --- DEBUGGING STEP: List contents of build context before COPY .env ---
# Added a dummy argument to 'echo' to bust Docker's build cache for this step.
RUN echo "--- Files in build context before COPY .env --- (Timestamp: $(date +%s))" && ls -la && echo "--- END Files ---"
# --- END DEBUGGING STEP ---

# --- IMPORTANT CHANGE: Explicitly copy .env first ---
#COPY .env .env
# --- END IMPORTANT CHANGE ---

# Copy the rest of the Laravel application into the container
COPY . /var/www/html

# Removed: RUN if [ ! -f .env ]; then cp .env.example .env; fi
# We are now explicitly copying the .env, so no need for this fallback

# Install PHP dependencies using Composer
RUN composer install --no-dev --optimize-autoloader

# Generate Laravel APP_KEY
RUN php artisan key:generate || true

# Set correct permissions for storage and cache directories
RUN chown -R www-data:www-data /var/www/html/storage \
    && chown -R www-data:www-data /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Expose port 8000 where Laravel's development server will run
EXPOSE 8000

# Command to run Laravel's built-in development server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
