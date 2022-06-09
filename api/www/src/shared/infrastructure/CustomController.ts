import { validate } from 'class-validator';

export class CustomController {
  protected validate(object: object): Promise<unknown> {
    return validate(object).then((errors) => {
      if (errors.length > 0) {
        return errors.map((error) => {
          return {
            [error.property]:
              error.constraints[Object.keys(error.constraints)[0]],
          };
        });
      }
      return null;
    });
  }
}
