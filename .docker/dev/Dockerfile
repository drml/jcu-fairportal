FROM node:14-alpine

RUN apk add --no-cache bash

# Create app directory
WORKDIR /code

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8081
EXPOSE 9229
EXPOSE 9230
CMD [ "npm", "run", "start:dev" ]
