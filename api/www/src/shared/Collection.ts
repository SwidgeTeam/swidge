export abstract class Collection {
  private readonly _items;

  public abstract type();

  constructor(items: unknown[]) {
    for (const item of items) {
      if (!(item instanceof this.type())) {
        throw new Error('Collection: Wrong item type');
      }
    }
    this._items = items;
  }

  public items<T>(): T {
    return this._items;
  }

  public count(): number {
    return this._items.length;
  }

  public map<T>(callback): T {
    return this._items.map(callback);
  }
}
