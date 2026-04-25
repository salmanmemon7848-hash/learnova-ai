FROM searxng/searxng:latest

# Copy configuration
COPY searxng-config/settings.yml /etc/searxng/settings.yml

# Set environment variables
ENV SEARXNG_BASE_URL=http://localhost:8080/
ENV SEARXNG_SETTINGS_PATH=/etc/searxng/settings.yml

# Expose port
EXPOSE 8080

# SearXNG runs automatically
