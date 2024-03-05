FROM golang:1.19

# Set the working directory in the container
WORKDIR /app/backend/mote

# Declare environment variables
ENV HASURAL_URL=
ENV AUTH_JWT=
ENV AUTH_JWT_PUBLIC_KEY=
ENV AUTH_JWT_PRIVATE_KEY=
ENV REDIS_URL=
ENV GOERLI_URL=
ENV SOLANA_ADDRESS=
ENV ETH_ADDRESS=
ENV INFURA_PROJECT_ID=
ENV SEPOLIA_URL=
ENV SEPOLIA_URL_HTTP=
ENV BTC_ADDRESS=
ENV TWILLO_ACCOUNT_SID=
ENV TWILLO_TOKEN=
ENV TWILLO_NUMBER=
ENV REDIS_SECRET=04eec09f
ENV GMAIL_APP_PASS=
ENV GMAIL=
ENV MAIL_SERVICE=
ENV R2_ACCESS_KEY_ID=
ENV R2_SECRET_ACCESS_KEY=
ENV R2_ACCOUNT_ID=
ENV R2_TOKEN=

# Copy the application code to the container
COPY go.mod go.sum Makefile ./

# Install app dependencies using Yarn
RUN go mod download
RUN make deps

# Copy the application code to the container
COPY .  .


# Build the pacakge
RUN make build

# Expose port 8080
EXPOSE 8085

# Command to run the application
CMD ["make", "dev"]
