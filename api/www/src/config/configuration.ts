import 'dotenv/config';

export default () => ({
  env: process.env.NODE_ENV || 'development',
  sqs_queue_url: process.env.SQS_QUEUE_URL,
  region: process.env.REGION,
  access_key: process.env.ACCESS_KEY,
  secret: process.env.SECRET,
});
