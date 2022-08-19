export abstract class SearchCriteria {
  private fields = {};

  public set(key: string, value: string): SearchCriteria {
    this.fields[key] = value;
    return this;
  }

  public get(key: string): string {
    return this.fields[key];
  }

  public exists(key: string): boolean {
    return key in this.fields && this.fields[key];
  }
}
