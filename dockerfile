# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Define volumes for MongoDB data and the Node.js app
VOLUME /app/node_modules

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["node", "smicamens.js"]