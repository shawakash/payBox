FROM node:20.6.0-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .
COPY .env.example .env

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
