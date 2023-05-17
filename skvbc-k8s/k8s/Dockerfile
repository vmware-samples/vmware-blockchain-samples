# syntax=docker/dockerfile:1

#FROM python:3.8-slim-buster
FROM python:3.8.10

EXPOSE 8080

WORKDIR /app

COPY . .

CMD [ "python3", "-u", "server.py" ]
