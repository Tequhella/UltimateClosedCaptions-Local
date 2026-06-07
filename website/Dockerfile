
FROM docker.io/library/node:18-alpine3.18 as build

WORKDIR /app

RUN npm install -g pnpm@8

#copy config
COPY *.json vite.config.ts yarn.lock ./
RUN yarn install --frozen-lockfile

#copy src files
COPY index.html ./
COPY src ./src/
COPY public ./public/

RUN yarn build

FROM docker.io/library/nginx:1.23-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
