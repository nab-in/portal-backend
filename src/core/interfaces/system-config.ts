export interface systemConfig {
  email: {
    auth: {
      user: string;
      pass: string;
    };
    smtp: string;
    adminpassword: string;
    adminemail: string;
  };
  port: number;
  profile: string;
  job: string;
  serverurl: string;
}
