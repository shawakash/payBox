FROM golang:1.21

# Set destination for COPY
WORKDIR /app/backend/mote

COPY go.mod go.sum Makefile ./
RUN make deps

COPY . ./

# Build
RUN make build

# Expose
EXPOSE 8085

# Run
CMD ["make", "dev"]