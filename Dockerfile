FROM node:18-alpine AS BUILD_IMAGE

RUN apk update && apk add yarn curl bash && rm -rf /var/cache/apk/*

# install node-prune
# RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

RUN yarn build

# RUN npm prune --omit=dev --legacy-peer-deps

FROM node:18-alpine

WORKDIR /usr/src/app

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules

EXPOSE 3030

CMD [ "node", "dist/main.js" ]
