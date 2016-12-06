const express = require('express');
const GitHubApi = require('github');
const git = require('simple-git')('./taiwan_love_wins');
const fs = require('fs');
const bodyParser = require('body-parser');

if (!process.env.GITHUB_TOKEN) {
  console.error('Missing GITHUB_TOKEN in environment vars');
  process.exit();
}

const PORT = process.env.PORT || 9487;
const app = express();

const github = new GitHubApi({
  protocol: 'https',
  host: 'api.github.com',
  Promise: require('bluebird'),
});

github.authenticate({
  type: 'token',
  token: process.env.GITHUB_TOKEN,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.post('/signatures', (req, res) => {
  const NAME = req.body.name;
  const EMAIL = req.body.email;
  const MESSAGE = req.body.message;

  fs.writeFile(`./taiwan_love_wins/signatures/signed_by_${NAME}.md`, MESSAGE, (err) => {
    if (!err) {
      git
        .addConfig('user.name', NAME)
        .addConfig('user.email', EMAIL)
        .add('./*')
        .commit(`${MESSAGE} - ${NAME}`)
        .push(['origin', 'master'], (err) => {
          if (!err) {
            github.pullRequests.create({
              owner: 'RainbowEngineer',
              repo: 'taiwan_love_wins',
              title: `[Bot] Signature from ${NAME}`,
              head: 'fantasywind:master',
              base: 'master',
            }, (err, de) => {
              if (!err) {
                console.log(`Finished ${NAME}`);

                res.status(201);
                res.send('成功發送！');
              }
            });
          }
        });
    }
  });
});

app.listen(PORT, () => console.log(`Server Listen on port ${PORT}`));
