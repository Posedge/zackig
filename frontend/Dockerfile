# development server
FROM node:12-alpine as dev

WORKDIR /opt/app/

CMD echo 'installing dependencies...' && npm install \
    && echo 'starting development server...' && npm start


# production build
FROM node:12-alpine as builder

WORKDIR /opt/app/
ADD package.json package-lock.json /opt/app/
RUN npm ci

ADD src/ /opt/app/src/
ADD public/ /opt/app/public/
RUN cp /opt/app/public/config.prod.js /opt/app/public/config.js
RUN npm run build


FROM nginx:alpine as runner

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /opt/app/build/ /usr/share/nginx/html/
