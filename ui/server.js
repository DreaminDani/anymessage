const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const getConfig = require('next/config').default;
const cookie = require('cookie');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { publicRuntimeConfig } = getConfig();
const { UI_HOSTNAME } = publicRuntimeConfig;

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      if (pathname === '/'
                || pathname === '/callback'
                || pathname === '/setup'
                || pathname.startsWith('/_next/')
                || pathname.startsWith('/static/')) {
        // allow unauthed paths without checking cookies
        handle(req, res, parsedUrl);
      } else {
        const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
        if (cookies.team_url === req.headers.host) {
          // render page if url matches expected team_url
          handle(req, res, parsedUrl);
        } else if (cookies.team_url) {
          // if user has a team_url, direct them there instead
          res.writeHead(302, {
            Location: `https://${cookies.team_url}${pathname}`,
          });
          res.end();
        } else if (cookies.access_token && cookies.id_token) {
          // users with no team_url but an auth token should go to setup
          res.writeHead(302, {
            Location: `https://www.${UI_HOSTNAME}/setup`,
          });
          res.end();
        } else {
          // user has bad auth state, force them to login
          res.writeHead(302, {
            Location: `https://www.${UI_HOSTNAME}?needsauth`,
          });
          res.end();
        }
      }
    })
      .listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
      });
  });
