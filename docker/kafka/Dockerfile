# Use the official Node.js image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app/packages/kafka

# Copy package.json and yarn.lock to the working directory
COPY package*.json ./
COPY tsconfig.json ./

# Install app dependencies using Yarn
RUN yarn install

# Copy the application code to the container
COPY .  .

# Build the pacakge
RUN yarn build

# Expose port 8080
EXPOSE 8081

# Command to run the application
CMD ["yarn", "dev"]
