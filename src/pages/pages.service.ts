import {Injectable} from '@angular/core';

@Injectable()
export class PagesService {
  private isBackdrop: boolean;
  private websites: Array<any> = [];
  private item: any = {id: 1, name: '', icon: '', url: ''};

  constructor() {}

  public setBackdrop(isBackdrop) {
    this.isBackdrop = isBackdrop;
  }

  public getBackdrop() {
    return this.isBackdrop;
  }

  public setWebsites(data) {
    localStorage.setItem('websites', JSON.stringify(data));
  }

  public getWebsites() {
    const websites = JSON.parse(localStorage.getItem('websites'));
    if (!websites) { return []; }
    return websites;
  }

  public setCacheKeyword(keywords) {
    localStorage.setItem('keywords', JSON.stringify(keywords));
  }

  public getCacheKeyword() {
    const keywords = JSON.parse(localStorage.getItem('keywords'));
    if (!keywords) { return []; }
    return keywords;
  }

  public getEditWebsites() {
    return this.websites;
  }

  public setEditWebsites(websites) {
    this.websites = websites;
  }

  public setItem(item) {
    this.item = item;
  }

  public getItem() {
    return this.item;
  }
}
