export interface Logger {
  log(msg: any): void;

  warn(msg: any): void;

  error(msg: any): void;
}
