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
  if (!config.serverurl) {
    config.serverurl = config.serverurl;
  }
  if (!config.email) {
    config.email = config.email;
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
  if (!fs.existsSync(config.cv)) {
    fs.mkdirSync(config.cv);
  }
  if (!files.cv) {
    files.cv = config.cv;
  }
  if (!fs.existsSync(config.dp)) {
    fs.mkdirSync(config.dp);
  }
  if (!files.dp) {
    files.dp = config.dp;
  }
  if (!fs.existsSync('./files/profile/user/dp/dp.png')) {
    fs.writeFileSync(
      './files/profile/user/dp/dp.png',
      fs.readFileSync('./dp.png'),
    );
  }
  if (!fs.existsSync('./files/profile/company/logo.png')) {
    fs.writeFileSync(
      './files/profile/company/logo.png',
      fs.readFileSync('./logo.png'),
    );
  }
  return {
    ...config,
    ...files,
  };
}
