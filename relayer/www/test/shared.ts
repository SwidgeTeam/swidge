import { createMock } from 'ts-auto-mock';
import { SQSMessage } from 'sqs-consumer';

export function createMessage(event: string, params: { key: string; value: string }[]) {
  const message = createMock<SQSMessage>();
  message.MessageAttributes = {};
  message.MessageAttributes.event = { DataType: 'String', StringValue: event };
  const body = {};
  for (const param of params) {
    body[param.key] = param.value;
  }
  message.Body = JSON.stringify(body);
  return message;
}
