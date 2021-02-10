FROM node:latest
ENV NODE_ENV=production

RUN npm install -g forever

RUN mkdir -p /usr/src/app/bitcoin-history
WORKDIR  /usr/src/app/bitcoin-history
COPY /bitcoin-history/package.json package.json
RUN npm install && npm cache verify
COPY /bitcoin-history/public public
COPY /bitcoin-history/src src
RUN npm run build

RUN mkdir -p /usr/src/app/api
WORKDIR  /usr/src/app/api
COPY /api/package.json package.json
RUN npm install && npm cache verify
COPY /api/server.js server.js
COPY /api/db db

EXPOSE 80

CMD [ "npm","start" ]


