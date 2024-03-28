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
COPY ["packages/common", "./packages/common"]
COPY ["backend/mail-zeus", "./backend/mail-zeus"]
COPY ["backend/mail", "./backend/mail"]


RUN cd /base
RUN yarn install
RUN yarn run build

EXPOSE 25

WORKDIR /base/backend/mail

CMD ["yarn", "dev"]
