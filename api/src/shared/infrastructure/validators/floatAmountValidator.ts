import { registerDecorator } from 'class-validator';

export function IsPositiveFloatString() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsPositiveFloatString',
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
            /^(\d*\.)?\d+$/.test(value) &&
            Number(value) > 0
          );
        },
      },
    });
  };
}
