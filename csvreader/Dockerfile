FROM node:15-alpine

RUN npm install -g forever

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json package.json
RUN npm install && npm cache verify
RUN mv /usr/src/app/node_modules /node_modules

COPY reader.js reader.js
COPY db db
CMD [ "npm","start" ]