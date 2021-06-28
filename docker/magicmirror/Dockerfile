FROM karsten13/magicmirror


# custom
COPY docs docs
COPY config config

EXPOSE 8180

ENTRYPOINT ["/usr/bin/tini", "--", "./entrypoint.sh"]
# ENTRYPOINT ["/sbin/tini", "--", "./entrypoint.sh"] // arm

