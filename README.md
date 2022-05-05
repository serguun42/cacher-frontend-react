# Cacher Frontend React

#### This project is being developed 🔧

---

Frontend for [TJournal and DTF cacher platform](https://cacher.serguun42.ru) built with React 18.

## Hot to

1. Install [Node.js](https://nodejs.org/) – `npm` included
2. Install necessary dependencies – `npm i --production`
3. [Edit prettyindex config file](#config) as you need
4. Edit nginx config:
   - Set `autoindex` to `on`
   - Set `autoindex_exact_size` to `on`
   - Set `autoindex_format` to `json`
   - Set port and other stuff in accordance with [prettyindex config](#config)
5. Edit [pm2 config](./config/pm2.production.json) if necessary
6. Start nginx (`start nginx.exe` or `systemctl start nginx`)
7. Start prettyindex – `npm run production`

## Configuration, building and launching

All configuration and build/launch scripts are highly modified files, build/ejected with command `npm run eject`/`react-scripts eject`

[BSL-1.0 License](./LICENSE)
