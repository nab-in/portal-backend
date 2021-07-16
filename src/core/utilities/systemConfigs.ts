import * as fs from 'fs';
let pathFolder = process.env.PORTAL;
if (!pathFolder) {
  if (!fs.existsSync('./files')) {
    fs.mkdirSync('./files');
    fs.mkdirSync('./files/profile');
  }
  if (!fs.existsSync('./files/config.json')) {
    fs.writeFileSync(
      './files/config.json',
      fs.readFileSync('./systemconfig.example.json'),
    );
  }
  pathFolder = __dirname.split('./files').join('');
}
const config = JSON.parse(fs.readFileSync('./files/config.json', 'utf8'));

export function getDataBaseConfiguration() {
  return {
    ...config.database,
  };
}

export function getConfiguration() {
  const files = config.files || {};
  if (!config.port) {
    config.port = config.serverport;
  }
  if (!files.profile) {
    files.profile = pathFolder + '/' + 'profile';
  }
  if (!fs.existsSync(files.profile)) {
    fs.mkdirSync(files.profile);
  }
  if (!files.job) {
    files.job = config.job;
  }
  if (!fs.existsSync(config.job)) {
    fs.mkdirSync(config.job);
  }
  if (!files.user) {
    files.user = config.user;
  }
  if (!fs.existsSync(config.user)) {
    fs.mkdirSync(config.user);
  }
  if (!files.company) {
    files.company = config.company;
  }
  if (!fs.existsSync(config.company)) {
    fs.mkdirSync(config.company);
  }

  return {
    ...config,
    ...files,
  };
}
