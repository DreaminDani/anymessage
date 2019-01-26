FROM starefossen/ruby-node:alpine

LABEL "com.github.actions.name"="Build AnyMessage docs"
LABEL "com.github.actions.description"="Builds anymesage docs"
LABEL "com.github.actions.icon"="mic"
LABEL "com.github.actions.color"="purple"

LABEL "repository"="http://github.com/d3sandoval/anymessage"
LABEL "homepage"="http://www.anymessage.io"
LABEL "maintainer"="Daniel Sandoval <daniel@anymessage.io>"

RUN set -xe \
    && apk add --no-cache bash git openssh

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["run deploy:docs"]