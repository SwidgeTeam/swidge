import 'dotenv/config';

export default () => ({
  env: process.env.NODE_ENV || 'development',
});
