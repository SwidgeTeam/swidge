import { createMock } from 'ts-auto-mock';
import { SQSMessage } from 'sqs-consumer';

export function createMessage(event: string, params: { key: string; value: string }[]) {
  const message = createMock<SQSMessage>();
  message.Body = event;
  message.MessageAttributes = {};
  for (const param of params) {
    message.MessageAttributes[param.key] = { DataType: 'String', StringValue: param.value };
  }
  return message;
}
