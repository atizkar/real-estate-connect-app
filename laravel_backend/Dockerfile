# laravel_backend/Dockerfile
# Use a PHP-FPM base image for serving PHP applications (Laravel)
FROM php:8.2-fpm-alpine

# Set working directory inside the container
WORKDIR /var/www/html

# Install system dependencies required for PHP extensions and Composer
# Each package is on its own line, with a backslash for continuation.
# No comments directly after the backslash to prevent parsing issues.
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
    # Clean up build dependencies after installation
    && rm -rf /var/cache/apk/* \
    # Install PHP extensions using docker-php-ext-install
    && docker-php-ext-install pdo pdo_mysql opcache gd exif

# Install Composer globally in the container
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Copy the entire Laravel application into the container
COPY . /var/www/html

# --- IMPORTANT FIX: Ensure .env exists before key generation ---
# Copy .env.example to .env if .env doesn't exist.
# This is crucial for `php artisan key:generate` to find its configuration file.
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Install PHP dependencies using Composer
# --no-dev: Skips dev dependencies (good for production builds)
# --optimize-autoloader: Improves performance by optimizing Composer's autoloader
RUN composer install --no-dev --optimize-autoloader

# Generate Laravel APP_KEY (if not already present in .env).
# The '|| true' ensures the build doesn't fail if the key is already set or generated.
RUN php artisan key:generate || true

# Set correct permissions for storage and cache directories
# These directories need to be writable by the web server (www-data user inside the container)
RUN chown -R www-data:www-data /var/www/html/storage \
    && chown -R www-data:www-data /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Expose port 8000 where Laravel's development server will run
EXPOSE 8000

# Command to run Laravel's built-in development server
# This makes the Laravel application accessible within the Docker network at port 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
