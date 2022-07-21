import { DomainException } from '../../shared/domain/DomainException';

export class PathNotFound extends DomainException {
  constructor() {
    super('PATH_NOT_FOUND', 400);
  }
}
