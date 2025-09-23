import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStoreService {
  private ls = window.localStorage;

  constructor() { }

  public setItem(key: string, value: any) {
    value = JSON.stringify(value);
    this.ls.setItem(key, value);
    return true;
  }

  public getItem(key: string): any {
    const value = this.ls.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch (e) {
      return null;
    }
  }

  public removeItem(key: string) {
    this.ls.removeItem(key);
  }

  public clear() {
    this.ls.clear();
  }
}
