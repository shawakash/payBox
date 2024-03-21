FROM node:21

WORKDIR /base

COPY ["package.json", "./package.json"]
COPY [".yarnrc", "./.yarnrc"]
COPY [".npmrc", "./.npmrc"]
COPY [".eslintrc.js", "./.eslintrc.js"]
COPY ["turbo.json", "./turbo.json"]
COPY ["yarn.lock", "./yarn.lock"]
COPY ["tsconfig.json", "./tsconfig.json"]

COPY ["packages/typescript-config", "./packages/typescript-config"]
COPY ["packages/eslint-config", "./packages/teslint-config"]
COPY ["backend/backend-common", "./backend/backend-common"]
COPY ["packages/common", "./packages/common"]
COPY ["packages/kafka", "./packages/kafka"]
COPY ["openapi", "./openapi"]
COPY ["backend/zeus", "./backend/zeus"]
COPY ["backend/api", "./backend/api"]


RUN cd /base
RUN yarn install
RUN yarn run build
RUN cd /base/backend/api && yarn run build
# KAFKA URL NEEDS TO BE SET AS ENVIRONMENT VARIABLE
RUN cd /base/packages/kafka && yarn run dev

EXPOSE 8080

WORKDIR /base/backend/api

CMD ["yarn", "dev"]
