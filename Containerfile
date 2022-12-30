# SPDX-License-Identifier: MIT
#
# Copyright (C) 2022 Olliver Schinagl <oliver@schinagl.nl>

FROM index.docker.io/library/alpine:latest AS builder

WORKDIR /src

COPY . /src/

RUN apk add --no-cache \
        git \
        nodejs-current \
        npm \
    && \
    npm ci \
        --no-fund \
        --production \
        --verbose \
    && \
    mkdir -p '/jshint/node_modules/jshint' && \
    cp -a 'node_modules/' '/jshint/' && \
    cp -a 'bin/' 'data/' 'dist/' 'src/' 'package.json' \
       '/jshint/node_modules/jshint' && \
    npm ci \
           --no-audit \
           --no-fund \
           --verbose \
    && \
    npm run pretest && \
    npm run test-262 && \
    npm run test-node && \
    npm run test-website && \
    node '/jshint/node_modules/jshint/bin/jshint' --version


FROM index.docker.io/library/alpine:latest

LABEL maintainer="Olliver Schinagl <oliver@schinagl.nl>"

RUN apk add --no-cache \
        nodejs-current \
    && \
    addgroup -S 'jshint' && \
    adduser -D -G 'jshint' -h '/var/lib/jshint' -s '/bin/false' -S 'jshint' && \
    ln -f -n -s '/usr/local/lib/node_modules/jshint/bin/jshint' '/usr/local/bin/jshint'

COPY --from=builder "/jshint/node_modules/" "/usr/local/lib/node_modules"
COPY "./containerfiles/container-entrypoint.sh" "/init"

ENTRYPOINT [ "/init" ]

USER 'jshint'
