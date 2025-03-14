FROM node:20.14.0

WORKDIR /app

COPY package*.json /app

RUN npm install

COPY . /app

EXPOSE 3000

CMD ["npm", "start"]