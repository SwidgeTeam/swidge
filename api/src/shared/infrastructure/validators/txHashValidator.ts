import { registerDecorator } from 'class-validator';

export function IsTxHash() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsTxHash',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'txHash must be a string of length 66',
      },
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.length === 66;
        },
      },
    });
  };
}
