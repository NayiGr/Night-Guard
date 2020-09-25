import {AfterContentInit, Component, OnInit} from '@angular/core';
import {PagesService} from '../pages.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'desktop-page',
  templateUrl: 'desktop.page.html',
  styleUrls: ['desktop.page.scss']
})

export class DesktopPage implements OnInit, AfterContentInit {
  private content: any;
  public date: string;
  public count: number;
  public isBackdrop: boolean;
  public isImage: boolean;
  public isHideTime: boolean;
  public isHideSet: boolean;
  public isAll: boolean;
  public isDisableSet: boolean;
  public isTouchSet: boolean;
  public outDesktop: any;
  public isDelayAlert: boolean;
  public isAlert: boolean;

  public firstLists: Array<any> = [
    {name: 'background', type: '背景', local: 'assets/icons/home.svg', status: false, display: true, check: false},
    {name: 'edit', type: '编辑', local: 'assets/icons/edit.svg', status: false, display: true, check: false},
    {name: 'delete', type: '删除', local: 'assets/icons/trash.svg', status: false, display: true, check: false}
  ];

  public secondLists: Array<any> = [
    {name: 'import', type: '导入', local: 'assets/icons/import.svg', status: false, display: true, check: false},
    {name: 'export', type: '导出', local: 'assets/icons/export.svg', status: false, display: true, check: false}
  ];

  constructor(private pages: PagesService) {}

  public setBackground(event) {
    const imgFile = new FileReader();
    if (event.target.files[0]) {
      imgFile.readAsDataURL(event.target.files[0]);
      imgFile.onload = (ev: any) => {
        this.content.style.backgroundImage = `url(${ev.currentTarget.result})`;
        this.setStorageBackground(ev.currentTarget.result);
        this.isImage = true;
      };
    }
  }

  public setStorageBackground(image) {
    localStorage.setItem('background', JSON.stringify(image));
  }

  public getStorageBackground() {
    return JSON.parse(localStorage.getItem('background'));
  }

  private initDate() {
    this.date = new Date().toISOString();
    setInterval(() => {
      this.date = new Date().toISOString();
    }, 1000);
  }

  ngOnInit(): void {
    this.initDate();
    this.isBackdrop = false;
    this.content = document.getElementById('content');
    this.content.style.backgroundImage = this.getStorageBackground() ? `url(${this.getStorageBackground()})` : 'unset';
    this.isImage = this.content.style.backgroundImage !== 'unset';
    this.isHideSet = window.innerWidth < 509;
    this.isHideTime = window.innerWidth < 1170;
    this.isAll = !this.isDisableSet && !this.isTouchSet;
  }

  ngAfterContentInit() {
    window.onresize = () => {
      const innerWidth = window.innerWidth;
      this.isHideSet = innerWidth < 509;
      this.isHideTime = innerWidth < 1170;
      this.outDesktop = {name: 'width', value: innerWidth};
    };
  }

  public inEdit(event) {
    switch (event.name) {
      case 'save':
        this.outDesktop = {name: 'param', value: event.value};
        break;
      case 'backdrop':
        this.isBackdrop = event.value;
        break;
    }
  }

  public getDesktopLists() {
    return this.isTouchSet ? this.secondLists : this.firstLists;
  }

  public inNav(event) {
    switch (event.name) {
      case 'delete':
        this.count = event.value;
        break;
      case 'edit':
        this.alertAdd();
        break;
    }
  }

  public setStatus(type) {
    if (type === 'enter') {
      this.isAll = false;
    } else {
      this.isTouchSet = false;
      this.isAll = !this.isDisableSet && !this.isTouchSet;
    }
  }

  public setFun(dl, type: string) {
    this.selectItem(dl.check, dl);
    if (type === 'edit' || type === 'save') {
      this.outDesktop = {name: 'edit', value: dl.check};
    } else if (type === 'delete') {
      this.count = 0;
      this.outDesktop = {name: 'delete', value: dl.check};
    } else if (type === 'background' || type === 'import' || type === 'export') {
      this.finishSelected(dl.check, dl);
      if (type === 'export') { this.exports(); }
    }
  }

  private finishSelected(result, dl) {
    setTimeout(() => {
      this.selectItem(result, dl);
    }, 1000);
  }

  private selectItem(isCheck, dl) {
    this.getDesktopLists().forEach(dls => {
      if (!isCheck) {
        dls.check = dls.name === dl.name;
        dls.status = !dls.check;
        this.isDisableSet = true;
      } else {
        dls.check = false;
        dls.status = dls.check;
        this.isDisableSet = false;
      }
    });
  }

  private alertAdd() {
    this.isBackdrop = true;
    this.pages.setBackdrop(true);
  }

  public exports() {
    const content = JSON.stringify({
      target: 'night-watch',
      content: this.pages.getWebsites(),
      background: this.getStorageBackground()
    });
    const blob = new Blob([content], {type: 'application/json; charset=UTF-8'});
    const date = new Date();
    FileSaver.saveAs(blob, `websites_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`);
  }

  public imports(event) {
    const jsonFile = new FileReader();
    if (event.target.files[0]) {
      jsonFile.readAsText(event.target.files[0], 'application/json; charset=UTF-8');
      jsonFile.onload = (ev: any) => {
        const res = JSON.parse(ev.currentTarget.result);
        if (res && res.constructor === Object && res.target === 'night-watch') {
          this.pages.setWebsites(res.content);
          this.setStorageBackground(res.background);
          this.content.style.backgroundImage = res.background ? `url(${res.background})` : 'unset';
          this.outDesktop = {name: 'import', value: true};
        } else {
          this.isDelayAlert = true;
          this.isAlert = true;
          setTimeout(() => {
            this.isAlert = false;
            setTimeout(() => {
              this.isDelayAlert = true;
            }, 300);
          }, 1000);
        }
      };
    }
  }

  public setReplace() {
    this.isTouchSet = !this.isTouchSet;
  }
}
