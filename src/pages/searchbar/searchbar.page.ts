import {Component, OnInit} from '@angular/core';
import {PagesService} from '../pages.service';

@Component({
  selector: 'searchbar-page',
  templateUrl: 'searchbar.page.html',
  styleUrls: ['searchbar.page.scss']
})

export class SearchbarPage implements OnInit {
  public modes: Array<any> = [];
  public currMode: any = {};
  public value: string;
  public isDropList: boolean;
  public isShell: boolean;
  public keywords: Array<any> = [];
  public kList: Array<any> = [];
  public isFocus: boolean;
  public isGroupArea: boolean;
  private url: string;

  constructor(private pages: PagesService) {}

  ngOnInit() {
    this.modes = [
      {mode: 'baidu', name: '百度', link: 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=', local: 'assets/icons/baidu.svg'},
      {mode: 'google', name: 'Google', link: 'https://www.google.com/search?hl=zh-CN&q=', local: 'assets/icons/google.svg'},
      {mode: 'bing', name: '必应', link: 'https://www.bing.com/search?isource=infinity&iname=bing&itype=web&q=', local: 'assets/icons/bing.svg'},
    ];
    this.currMode = this.getSearchEngines() ? this.getSearchEngines() : this.modes[0];
  }

  public setSearchEngines(engines) {
    localStorage.setItem('engines', JSON.stringify(engines));
  }

  public getSearchEngines() {
    return localStorage.getItem('engines') ? JSON.parse(localStorage.getItem('engines')) : null;
  }

  public showDrop(isDropList) {
    if (isDropList) {
      this.isDropList = isDropList;
      setTimeout(() => {
        this.isShell = this.isDropList;
      }, 100);
    } else {
      this.kList = this.pages.getCacheKeyword();
      this.keywords = JSON.parse(JSON.stringify(this.kList));
      if (this.value) {
        this.inputKeyword();
      }
      this.isFocus = true;
      this.isGroupArea = true;
      this.isShell = isDropList;
      setTimeout(() => {
        this.isDropList = this.isShell;
      }, 100);
    }
  }

  public search() {
    this.url = this.value ? `${this.currMode.link}${this.value}` : `${this.currMode.link}`;
    window.open(this.url, '_blank');
    if (this.value) {
      this.kList.unshift({id: null, value: this.value});
      this.setKeywords();
      this.pages.setCacheKeyword(this.kList);
      this.inputKeyword();
    }
  }

  public inputKeyword() {
    this.keywords = JSON.parse(JSON.stringify(this.pages.getCacheKeyword()))
        .filter(k => k.value !== this.value && k.value.includes(this.value));
  }

  public select(mode) {
    this.currMode = mode;
    this.setSearchEngines(mode);
    this.showDrop(false);
  }

  public remove(event, k) {
    this.kList.forEach((keyword, i) => {
      if (k.id === keyword.id) {
        this.kList.splice(i, 1);
        this.setKeywords();
        this.pages.setCacheKeyword(this.kList);
        this.keywords = JSON.parse(JSON.stringify(this.pages.getCacheKeyword()));
        return;
      }
    });
    event.stopPropagation();
  }

  public selectKeyword(k, inputElement) {
    this.value = k.value;
    inputElement.focus();
    this.inputKeyword();
  }

  private setKeywords() {
    if (this.kList.length) {
      this.kList.forEach((k, i) => {
        k.id = i + 1;
        if (this.value && k.id !== 1 && this.value === k.value) {
          this.kList.splice(i, 1);
        }
      });
    }
  }

  public enterGroup() {
    if (this.isFocus) {
      this.isGroupArea = true;
    }
  }

  public leaveGroup(inputElement) {
    if (this.isFocus) {
      inputElement.focus();
      this.isGroupArea = false;
    }
  }

  public inputBlur() {
    if (!this.isGroupArea) {
      this.isFocus = false;
    }
  }
}
