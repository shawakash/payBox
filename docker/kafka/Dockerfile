# Use the official Node.js image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app/packages/kafka

# Copy the application code to the container
COPY .  .

# Install app dependencies using Yarn
RUN yarn install

# Build the pacakge
RUN yarn build


# Command to run the application
CMD ["yarn", "dev"]
