FROM node:10-slim

LABEL "com.github.actions.name"="Build AnyMessage docs"
LABEL "com.github.actions.description"="Builds anymesage docs"
LABEL "com.github.actions.icon"="mic"
LABEL "com.github.actions.color"="purple"

LABEL "repository"="http://github.com/d3sandoval/anymessage"
LABEL "homepage"="http://www.anymessage.io"
LABEL "maintainer"="Daniel Sandoval <daniel@anymessage.io>"

ADD entrypoint.sh /entrypoint.sh
CMD ["/entrypoint.sh"]