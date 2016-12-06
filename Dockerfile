FROM node:6.9

MAINTAINER fantasyatelier@gmail.com

ENV PORT 80
ENV NODE_ENV production

RUN mkdir -p /var/www
RUN mkdir -p /root/.ssh
ADD keys/ /root/.ssh
RUN touch /root/.ssh/known_hosts
RUN ssh-keyscan -T 60 github.com >> /root/.ssh/known_hosts
RUN chmod 600 /root/.ssh/*
RUN git clone --recursive git@github.com:fantasywind/rainbow-bot.git /var/www/bot

WORKDIR /var/www/bot

RUN npm i

EXPOSE 80

CMD node /var/www/bot/index.js
