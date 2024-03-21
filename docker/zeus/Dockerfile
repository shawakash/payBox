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
COPY ["packages/eslint-config", "./packages/teslint-config"]
COPY ["backend/zeus", "./backend/zeus"]

RUN cd /base
RUN yarn install
RUN cd /base/backend/zeus && yarn run zeus && yarn run codegen
RUN yarn run build

WORKDIR /base/backend/zeus

CMD ["yarn", "dev"]


