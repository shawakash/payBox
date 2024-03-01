FROM node:21-alpine

WORKDIR /app/apps/web

ENV GITHUB_SECRET=
ENV GITHUB_ID=
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=8Qcbkqt7o0TDWeDupyoQjl/yep9usSZlK4jME93VjCI=
ENV GOOGLE_ID=
ENV GOOGLE_SECRET=

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

# Build the Next.js app
RUN yarn build

EXPOSE 3000

# Start the Next.js app
CMD ["yarn", "start"]