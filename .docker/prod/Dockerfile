## this is the stage one , also know as the build step

FROM node:14-alpine

WORKDIR /code
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

## this is stage two , where the app actually runs

FROM node:14-alpine

WORKDIR /code
COPY package*.json ./
RUN npm ci --only=production
COPY env/production.env ./env/production.env
COPY data ./data
COPY --from=0 /code/dist ./dist
EXPOSE 8081
CMD npm start
