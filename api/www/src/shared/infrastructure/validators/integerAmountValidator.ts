import { registerDecorator } from 'class-validator';

export function IsPositiveIntegerString() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsPositiveIntegerString',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'amount must be a positive number string',
      },
      validator: {
        validate(value: any) {
          return (
            typeof value === 'string' &&
            /^-?\d+$/.test(value) &&
            Number(value) > 0
          );
        },
      },
    });
  };
}
