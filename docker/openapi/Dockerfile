# Use the official Node.js image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app/openapi/

# Copy package.json and yarn.lock to the working directory
COPY . .

# Install app dependencies using Yarn
RUN yarn install

# Copy the application code to the container

# Build the pacakge
RUN yarn build

# Generate the openapi client
RUN yarn gen

# Command to run the application
CMD ["yarn", "dev"]
