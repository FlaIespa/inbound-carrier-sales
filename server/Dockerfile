# 1. Use official Node.js LTS base image
FROM node:18-alpine

# 2. Create and set working directory
WORKDIR /app

# 3. Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# 4. Copy the rest of the application source
COPY . .

# 5. Expose the port your server listens on
EXPOSE 4000

# 6. For security, run as non-root user
USER node

# 7. Default command to start your server
CMD ["node", "index.js"]
