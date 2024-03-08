# Go parameters
GOCMD = go
GOBUILD = $(GOCMD) build
GOTEST = $(GOCMD) test
GOCLEAN = $(GOCMD) clean
GOGET = $(GOCMD) get

# Main package
MAIN = ./src/main.go
BINARY_NAME = dist/mote

# Test package
TEST_PACKAGE = ./...

# Build the binary
build:
	mkdir -p dist
	$(GOBUILD) -o $(BINARY_NAME) $(MAIN)

# Run tests
test:
	$(GOTEST) $(TEST_PACKAGE)

# Clean up generated files
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)

# Install dependencies
deps:
	$(GOGET) ./...

# Run the binary
dev:
	./$(BINARY_NAME)

# Build and run the binary
all: deps build run

# Default target
.DEFAULT_GOAL := all
