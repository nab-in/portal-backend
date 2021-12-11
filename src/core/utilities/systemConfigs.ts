import * as fs from 'fs';
let pathFolder = process.env.PORTAL;
if (!fs.existsSync('./files')) {
  fs.mkdirSync('./files');
  fs.mkdirSync('./files/profile');
}

const config = {
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    dropSchema: false,
    entities: ['dist/modules/**/entities/*.entity.js'],
    migrations: ['dist/database/migrations/**/*.js'],
    subscribers: ['src/subscriber/**/*.ts'],
    migrationsRun: true,
  },
  email: {
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    smtp: process.env.SMTP,
    port: Number(process.env.SMTP_PORT),
    adminpassword: process.env.ADMIN_PASSWORD,
    adminemail: process.env.ADMIN_EMAIL,
  },
  serverport: Number(process.env.SERVERPORT),
  cv: process.env.FILES_CV,
  dp: process.env.FILES_DP,
  user: process.env.FILES_USER,
  job: process.env.FILES_JOB,
  company: process.env.FILES_COMPANY,
  serverurl: process.env.SERVER_URL,
};

export const getDataBaseConfiguration = {
  ...config.database,
  migrations: ['../../../database/migration/*.ts'],
};

export function getConfiguration() {
  const files = config['files'] || {};
  if (!config['port']) {
    config['port'] = config.serverport;
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
  if (!fs.existsSync(config.company)) {
    fs.mkdirSync(config.company);
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
