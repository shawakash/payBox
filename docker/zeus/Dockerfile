# Use the official Node.js image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app/openapi/

# Copy package.json and yarn.lock to the working directory
COPY . .

# Install app dependencies using Yarn
RUN yarn install

# Copy the application code to the container

# Build the package
RUN yarn build

# Command to Create the client
CMD ["yarn", "zeus"]

# Commad to Generate the client
CMD ["yarn", "codegen"]


