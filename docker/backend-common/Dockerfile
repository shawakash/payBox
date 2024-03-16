# Use the official Node.js image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app/backend/backend-common

# Copy package.json and yarn.lock to the working directory
COPY . .

# Install app dependencies using Yarn
RUN yarn install


# Build the pacakge
RUN yarn build

