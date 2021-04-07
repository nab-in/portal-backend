FROM node:15.5.1-alpine3.12
RUN mkdir /home/app
WORKDIR /home/app
COPY package*.json ./
COPY ["nodemon.json", "nodemon-debug.json", "tsconfig.json", "tsconfig.build.json","./"]
RUN npm install
CMD npm run start