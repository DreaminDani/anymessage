FROM node:10

WORKDIR /usr/api

COPY package.json .
RUN npm install --quiet

COPY . .

EXPOSE 1337/tcp

RUN npm run build
CMD npm start