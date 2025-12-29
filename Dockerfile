# Use an official Node.js runtime as a base image
FROM node:latest

# Update npm to the latest version
RUN npm install -g npm@latest

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Expose the port on which your application runs
EXPOSE 8000

# Start the application
CMD ["node", "index.js"]
