FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# idk but npm i -D typescript is not working here
RUN ["/bin/bash", "-c", "npm install -g typescript"]

CMD ["npm", "start"]
