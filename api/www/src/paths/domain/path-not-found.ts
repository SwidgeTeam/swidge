import { DomainException } from '../../shared/domain/domain-exception';

export class PathNotFound extends DomainException {
  constructor() {
    super('PATH_NOT_FOUND', 400);
  }
}
