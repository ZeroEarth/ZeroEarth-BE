# Use official Node.js image
FROM node:20-alpine
ARG PORT
ENV PORT=$PORT

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE ${PORT}

# Start the app
CMD ["npm", "start"]
