FROM node:alpine As development

WORKDIR /usr/src/app

COPY package*.json ./
COPY .env ./

COPY ./dist/libs ./dist/libs

RUN npm install

COPY . .

RUN npm run build tickets

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./
COPY .env ./

COPY ./dist/libs ./dist/libs

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/tickets/main"]