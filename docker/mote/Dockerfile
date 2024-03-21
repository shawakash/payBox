FROM golang:1.21

WORKDIR /app/backend/mote

COPY go.mod go.sum Makefile ./
RUN make deps

COPY . ./

RUN make build

EXPOSE 8080

CMD ["make", "dev"]
