#!/bin/sh

set -e

for domain in $RENEWED_DOMAINS; do
        case $domain in
        example.com)
                daemon_cert_root=/your/anymessage/directory/nginx/certs

                # Make sure the certificate and private key files are
                # never world readable, even just for an instant while
                # we're copying them into daemon_cert_root.
                umask 077

                cp "$RENEWED_LINEAGE/fullchain.pem" "$daemon_cert_root/cert.pem"
                cp "$RENEWED_LINEAGE/privkey.pem" "$daemon_cert_root/key.pem"

                # Apply the proper file ownership and permissions for
                # the daemon to read its certificate and key.
                chown anymessage:anymessage "$daemon_cert_root/cert.pem" \
                        "$daemon_cert_root/key.pem"
                chmod 400 "$daemon_cert_root/cert.pem" \
                        "$daemon_cert_root/key.pem"

                # if using systemd
                systemctl restart anymessage-app  >/dev/null
                ;;
        esac
done