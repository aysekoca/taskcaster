FROM golang:1.25.4 AS builder

WORKDIR /build

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o ./taskcaster

FROM alpine:3.22.2

WORKDIR /app

COPY --from=builder /build/taskcaster .

EXPOSE 3001

CMD ["./taskcaster"]



