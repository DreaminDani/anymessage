FROM ruby:alpine

LABEL "com.github.actions.name"="Build AnyMessage docs"
LABEL "com.github.actions.description"="Builds anymesage docs"
LABEL "com.github.actions.icon"="mic"
LABEL "com.github.actions.color"="purple"

LABEL "repository"="http://github.com/d3sandoval/anymessage"
LABEL "homepage"="http://www.anymessage.io"
LABEL "maintainer"="Daniel Sandoval <daniel@anymessage.io>"

RUN apk add --no-cache \
    openssh-client \
    ruby-dev \
    build-base \
    git \
    openssh \
    nodejs-current \
    nodejs-current-npm \
    && gem install --no-document  \
    jekyll \
    bundler

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["run deploy"]