FROM golang:1.19

# Set the working directory in the container
WORKDIR /app/backend/mote/

# Declare environment variables
ENV REDIS_URL=
ENV ETH_ADDRESS=
ENV INFURA_PROJECT_ID=
ENV SEPOLIA_URL=
ENV SEPOLIA_URL_HTTP=
ENV REDIS_SECRET=04eec09f

# Copy the application code to the container
COPY .  .
RUN ls -la

# Install app dependencies using Yarn
RUN go mod download
RUN make deps


# Build the pacakge
RUN make build

# Expose port 8080
EXPOSE 8085

# Command to run the application
CMD ["make", "dev"]
