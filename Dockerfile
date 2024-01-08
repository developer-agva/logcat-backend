# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install
RUN npm install -g npm@10.2.5

# Bundle your app source code into the container
COPY . .
 
# Expose the port your app runs on
EXPOSE 8000

# Command to run your application
CMD ["node", "index.js"]
