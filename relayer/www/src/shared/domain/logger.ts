export interface Logger {
  error(message: any, ...optionalParams: any[]): any;

  log(message: any, ...optionalParams: any[]): any;

  warn(message: any, ...optionalParams: any[]): any;
}
