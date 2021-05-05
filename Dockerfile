FROM node:15.5.1-alpine3.12
RUN apk add --no-cache tzdata
ENV TZ Africa/Dar_es_Salaam
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN mkdir /home/app
WORKDIR /home/app
COPY package*.json ./
COPY ["ormconfig.json","tsconfig.json", "tsconfig.build.json","./"]
RUN npm install
CMD npm run start