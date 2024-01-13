# Use the official Node.js image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app/backend/api

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install app dependencies using Yarn
RUN yarn install

# Copy the application code to the container
COPY . .

# Expose port 8080
EXPOSE 8080

# Command to run the application
CMD ["yarn", "start"]
