FROM denoland/deno:1.28.0

WORKDIR /app

COPY . .
RUN deno install -qAn vr https://deno.land/x/velociraptor@1.5.0/cli.ts

CMD ["vr", "start"]
