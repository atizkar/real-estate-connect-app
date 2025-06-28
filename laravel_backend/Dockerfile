# laravel_backend/Dockerfile
# Use a PHP-FPM base image for serving PHP applications (Laravel)
FROM php:8.2-fpm-alpine

# Set working directory inside the container
WORKDIR /var/www/html

# Install system dependencies required for PHP extensions and Composer
RUN apk add --no-cache \
    nginx \ # Nginx is included here if you want to swap to Nginx for serving Laravel directly in this container, but currently, we're using php-artisan-serve.
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
    # Clean up build dependencies
    && rm -rf /var/cache/apk/* \
    # Install PHP extensions
    && docker-php-ext-install pdo pdo_mysql opcache gd exif

# Install Composer globally in the container
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Copy the entire Laravel application into the container
COPY . /var/www/html

# Install PHP dependencies using Composer
# --no-dev: Skips dev dependencies (good for production builds)
# --optimize-autoloader: Improves performance by optimizing Composer's autoloader
RUN composer install --no-dev --optimize-autoloader

# Generate Laravel APP_KEY (if not already present in .env)
# This command generates a unique encryption key for your application.
# It's crucial for security and should be run once during setup.
# If you provide APP_KEY via docker-compose.yml environment, this step is not strictly necessary
# as long as the .env file within the container reflects that.
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

# Alternative CMD for production with Nginx/php-fpm (if you choose that setup later):
# CMD ["sh", "-c", "nginx -g 'daemon off;' && php-fpm"]
