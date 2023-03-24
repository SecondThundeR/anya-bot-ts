FROM denoland/deno:1.32.1

WORKDIR /app

COPY . .

CMD ["deno", "task", "start"]
