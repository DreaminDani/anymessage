FROM node:10

WORKDIR /usr/ui

COPY package.json .
RUN npm install --quiet

COPY . .

RUN npm run build

CMD npm start