# Use the official Node.js image as the base image
FROM node:21

# Set the working directory in the container
WORKDIR /app/backend/ws

# Declare environment variables
ENV HASURAL_URL=
ENV AUTH_JWT=
ENV AUTH_JWT_PUBLIC_KEY=
ENV AUTH_JWT_PRIVATE_KEY=
ENV REDIS_URL=
ENV REDIS_SECRET=
ENV GMAIL_APP_PASS=
ENV GMAIL=
ENV MAIL_SERVICE=
ENV R2_ACCESS_KEY_ID=
ENV R2_SECRET_ACCESS_KEY=
ENV R2_ACCOUNT_ID=
ENV R2_TOKEN=

# Copy the application code to the container
COPY .  .

# Install app dependencies using Yarn
RUN yarn install

# Build the pacakge
RUN yarn build

# Expose port 8080
EXPOSE 8081

# Command to run the application
CMD ["yarn", "dev"]
