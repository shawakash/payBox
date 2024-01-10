FROM node:21-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

# Build the Next.js app
RUN yarn build

EXPOSE 3000

# Start the Next.js app
CMD ["yarn", "start"]