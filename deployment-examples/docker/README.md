# Docker examples
These examples use an nginx container and a mounted data volume for postgresql.

Examples include:
1. Non-SSL
Useful for proof of concept deployments. Not recommended for production.
To use:
- Copy `docker-compose.prod.yml` to your root directoy along with the `nginx` directory
- Run `docker-compose -f docker-compose.prod.yml up` to start the services (make sure nothing else is already running on port 80)
- To get the latest images, run `docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up`
- If you change your nginx.conf, you have to rebuild the nginx container: `docker-compose -f docker-compose.prod.yml build nginx`

2. SSL
Useful for production deploys. To use:
- copy `docker-compose.prod-ssl.yml` to your root directory along with the nginx-ssl directory
- rename `nginx-ssl` to `nginx` so `.gitingore` can ignore them and prevent accidental committing
- Install Certbot (see: https://certbot.eff.org/ for your OS. Choose "other")
- Run this command `sudo certbot certonly --manual --preferred-challenges=dns --email example@yourdomain.tld --agree-tos -d *.yourdomain.tld`
- follow the instructions to create a DNS record
- copy/create your SSL certs (cert.pem and key.pem) in the new nginx/certs directory:
```
fullchain.pem >> cert.pem
privkey.pem >> key.pem
(make sure to chown as the user who the service is running under and chmod to 400)
```
- create a cronjob that will auto-update the certs `certbot renew --deploy-hook /your/anymessage/directory/nginx/cert-renew.sh`
- run `docker-compose -f docker-compose.prod-ssl.yml up` to pull the images

3. systemd service
Useful if you want your OS to restart the docker stack on startup. To use:
- copy the `anymessage-app.service` to your machine's `/etc/systemd/system/` and update the path to your anymessage directory.
- run the following:
```
sudo systemctl enable anymessage-app.service
sudy systemctl start anymessage-app.service
```