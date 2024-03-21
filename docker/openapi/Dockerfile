# Use the official Node.js image as the base image
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
COPY ["packages/eslint-config", "./packages/eslint-config"]
COPY ["packages/kafka", "./packages/kafka"]
COPY ["packages/common", "./packages/common"]
COPY ["backend/backend-common", "./backend/backend-common"]
COPY ["openapi", "./openapi"]

RUN cd /base
RUN yarn install
RUN yarn run build

WORKDIR /base/openapi

CMD ["yarn", "dev"]
