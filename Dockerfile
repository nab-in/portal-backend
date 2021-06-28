FROM node:14.16.1-alpine3.12
RUN apk add --no-cache tzdata
RUN apk add --no-cache --virtual .gyp python3 make gcc g++
ENV TZ Africa/Dar_es_Salaam
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN mkdir /home/app
WORKDIR /home/app
COPY ["package.json", "tsconfig.json", "tsconfig.build.json","./"]
RUN npm install && apk del .gyp
COPY ["src","./src"]
RUN npm run build
CMD npm run start