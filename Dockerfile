FROM node:alpine

RUN mkdir -p /var/alexinator
WORKDIR /var/alexinator

COPY . /var/alexinator

RUN npm install

EXPOSE 5000

ENTRYPOINT npm start
