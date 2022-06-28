import 'dotenv/config';

export default () => ({
  environment: process.env.NODE_ENV || 'development',
  api_url: process.env.API_URL || 'http://localhost:3000',
  private_key: process.env.PRIVATE_KEY,
  sqs_queue_url: process.env.SQS_QUEUE_URL,
  region: process.env.REGION,
  access_key: process.env.ACCESS_KEY,
  secret: process.env.SECRET,
  auth_token: process.env.API_AUTH_TOKEN,
});
