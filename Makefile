dev:
	go run backend/mote/src/main.go

test:
	cd backend/mote && go test ./...

build:
	cd backend/mote && go build -o dist/mote src/main.go