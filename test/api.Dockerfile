FROM node:alpine

RUN mkdir /srv/github-actions-app
WORKDIR /srv/github-actions-app
COPY ./api/package.json ./api/package-lock.json ./
RUN npm ci
COPY ./api .
RUN npm test