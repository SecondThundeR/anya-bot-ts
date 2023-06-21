FROM denoland/deno:alpine

WORKDIR /app

COPY . .

CMD ["deno", "task", "start"]
