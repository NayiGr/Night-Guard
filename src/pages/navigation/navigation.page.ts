import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {PagesService} from '../pages.service';
declare var $: any;

@Component({
  selector: 'navigation-page',
  templateUrl: 'navigation.page.html',
  styleUrls: ['navigation.page.scss'],
})

export class NavigationPage implements OnInit, OnChanges {
  public websites: Array<any> = [];
  public minColumns = 3;
  public styleWidth: number;
  public isEdit: boolean;
  private isDelete: boolean;
  private total: Array<any> = [];
  private maxColumns: number;
  private maxColWidth: number;
  private highMargin: number;
  private maxWidth: number;
  private midWidth: number;
  private delWebsites: Array<any> = [];
  @Input() inDesktop: any;
  @Output() outNav: EventEmitter<any> = new EventEmitter<any>();

  constructor(private pages: PagesService) {}

  private initDataNum() {
    this.maxColWidth = 450 + 60;  // nav-list's width and margin
    this.highMargin = 6;
    this.maxWidth = this.maxColWidth * 3;
    this.midWidth = this.maxColWidth * 2;
    this.isDelete = false;
  }

  private initWaterFall() {
    this.total = [];
    this.waterfall();
  }

  private initPage() {
    this.initDataNum();
    this.getWebsites();
    this.resizeWidth(window.innerWidth);
    this.saveItem(false);
  }

  ngOnInit() {
    this.initPage();
  }

  ngOnChanges(changes) {
    if (changes.inDesktop && changes.inDesktop.currentValue !== undefined) {
      const data = changes.inDesktop.currentValue;
      switch (data.name) {
        case 'width':
          this.resizeWidth(data.value);
          break;
        case 'param':
          this.getWebsites();
          this.setNav(data.value);
          break;
        case 'edit':
        case 'import':
          this.setEdit(data);
          break;
        case 'delete':
          this.setDelete(data.value);
          break;
      }
    }
  }

  private setEdit(editType) {
    if (editType.name === 'edit') {
      this.isEdit = editType.value;
      if (this.isEdit) {
        this.getWebsites();
        this.addBlank();
      } else {
        this.saveItem();
      }
      setTimeout(() => {
        this.sortable(this.isEdit);
      }, 100);
    } else if (editType.name === 'import') {
      this.getWebsites();
      this.saveItem();
    }
    this.initWaterFall();
  }

  private setDelete(setDel) {
    this.isDelete = setDel;
    if (this.isDelete) {
      this.delWebsites = [];
      this.websitesArray((website) => {
        website.isDelete = false;
      });
    } else {
      this.saveItem();
      this.initWaterFall();
    }
  }


  private compare(property?) {
    return (a, b) => {
      return property ? a[property] - b[property] : a - b;
    };
  }

  private sortable(data) {
    this.websites.forEach(group => {
      if (group.id) {
        const listId = $(`#list_${group.id}`);
        listId.sortable({
          items: '.sortable-col',
          placeholder: 'sortable-placeholder',
          update: () => {
            const newWebs = $(`#list_${group.id}`).sortable('toArray');
            let sortWebs = [], websId = [];
            newWebs.forEach(nw => {
              const nwId = Number(nw.substr(5));
              sortWebs = sortWebs.concat(group.websites.filter(ow => ow.id === nwId));
            });
            websId = sortWebs.map(sw => sw.id);
            websId.sort(this.compare());
            sortWebs.forEach((sw, o) => {
              sw.id = websId[o];
            });
            if (group.websites[group.websites.length - 1].id === null) {
              sortWebs = sortWebs.concat(group.websites[group.websites.length - 1]);
            }
            group.websites = sortWebs;
            this.pages.setWebsites(this.websites);
          },
        });
        data ? listId.sortable('enable') : listId.sortable('disable');
      }
    });
  }

  private websitesArray(callback) {
    this.websites.forEach(group => {
      group.websites.forEach((website, index) => {
        callback(website, index, group);
      });
    });
  }

  private addBlank() {
    this.websites.push({id: null, title: '', websites: []});
    this.websites.forEach(group => {
      group.websites.push({id: null, name: '', icon: '', url: ''});
    });
  }

  private resizeWidth(winWidth) {
    if (this.maxWidth < winWidth) {
      this.maxColumns = 3;
      this.styleWidth = this.maxColWidth * 3;
    } else if (this.maxWidth >= winWidth - 1 && winWidth - 1 > this.midWidth) {
      this.maxColumns = 2;
      this.styleWidth = this.maxColWidth * 2;
    } else if (this.midWidth >= winWidth - 1) {
      this.maxColumns = 1;
      this.styleWidth = this.maxColWidth;
    }
    this.initWaterFall();
  }

  private getWebsites() {
    this.websites = this.pages.getWebsites();
    if (!this.isEdit) {
      this.websites.forEach(group => {
        group.websites.sort(this.compare('id'));
      });
    }
  }

  public getActive(website, group) {
    if (this.isDelete) {
      website.isDelete = !website.isDelete;
      if (website.isDelete) {
        this.delWebsites.push(website);
      } else {
        for (let i = this.delWebsites.length - 1; i >= 0; i--) {
          if (this.delWebsites[i].id === website.id) {
            this.delWebsites.splice(i, 1);
          }
        }
      }
      this.outNav.emit({name: 'delete', value: this.delWebsites.length});
    } else {
      if (this.isEdit) {
        this.outNav.emit({name: 'edit', value: true});
        this.pages.setItem({group: {id: group.id, name: group.title}, website});
        this.pages.setEditWebsites(this.websites);
      } else {
        window.open(website.url, '_blank');
      }
    }
  }

  private waterfall() {
    let singleRow = [], seqSort = 0;
    const colHeight = 55;
    const residue = this.websites.length % this.maxColumns;
    const totalRow = Math.floor(this.websites.length / this.maxColumns);

    this.websites.forEach((group, index) => {
      const i = index + 1;
      const webs = group.websites;
      const row = Math.floor(index / this.maxColumns) + 1;
      let height = Math.floor(webs.length / this.minColumns) + 1;

      if (webs.length % this.minColumns) {
        height = (height + 1) * colHeight + this.highMargin;
      } else {
        height = height * colHeight + this.highMargin;
      }

      seqSort = seqSort === this.maxColumns ? 1 : ++seqSort;
      singleRow.push({
        id: group.id,
        height, row,
        seqSort: Math.floor(i % this.maxColumns) ? Math.floor(i % this.maxColumns) : this.maxColumns,
      });

      if (row === 1) {
        singleRow.sort(this.compare('height'));
        singleRow.forEach((data, idx) => {
          data.totalHeight = data.height;
          data.highSort = idx + 1;
          data.positSort = data.seqSort;
          data.top = 0;
        });
      }

      if (i % this.maxColumns === 0) {
        this.total = this.total.concat(singleRow);
        singleRow = [];
      } else if (row > totalRow && residue && this.websites.length === i) {
        this.total = this.total.concat(singleRow);
      }
    });

    this.setTotal();
  }

  private setTotal() {
    let row = [], total = [];
    const residue = this.total.length % this.maxColumns;
    this.total.forEach((t, index) => {
      if (t.row > 1) {
        row.push(t);
        if ((index + 1) % this.maxColumns === 0) {
          this.setTotalHeight(row);
          total = total.concat(row);
          row = [];
        } else if (t.row === this.total[this.total.length - 1].row && residue && this.total.length === index + 1) {
          this.setTotalHeight(row);
          total = total.concat(row);
        }
      }
    });
    this.setTotalSort();
  }

  private setTotalHeight(row) {
    row.forEach(col => {
      for (const t of this.total) {
        if (t.row === col.row - 1 && col.seqSort === t.highSort) {
          col.totalHeight = col.height + t.totalHeight;
          col.top = t.totalHeight;
          if (col.row - 1 > 1) {
            col.positSort = t.positSort;
          } else {
            col.positSort = t.seqSort;
          }
        }
      }
    });
    row.sort(this.compare('positSort'));
    row.sort(this.compare('totalHeight'));
    row.forEach((col, index) => {
      col.highSort = index + 1;
    });
  }

  private setTotalSort() {
    this.websites.forEach(group => {
      for (const t of this.total) {
        if (t.id === group.id) {
          group.height = t.height;
          group.totalHeight = t.totalHeight;
          group.row = t.row;
          group.seqSort = t.seqSort;
          group.highSort = t.highSort;
          group.positSort = t.positSort;
          group.top = t.top;
          group.left = this.maxColWidth * (group.positSort - 1);
        }
      }
    });
  }

  private setNav(data) {
    if (data) {
      if (data.group.type === 'add') {
        this.websites.push({id: null, title: '', websites: [{id: null, name: '', icon: '', url: ''}]});
      }
      if (data.website.type === 'add') {
        this.websites.forEach(group => {
          if (data.group.id === group.id) {
            group.websites.push({id: null, name: '', icon: '', url: ''});
          }
        });
      }
    }
    this.initWaterFall();
  }

  private saveItem(isSplice: boolean = true) {
    for (let i = this.websites.length - 1; i >= 0; i--) {
      this.deleteItem(this.websites[i], isSplice);
      if (!this.websites[i].id || (this.websites[i].websites.length === 0 && !this.websites[i].title)) {
        this.websites.splice(i, 1);
      }
    }
    this.websitesArray((website) => {
      if (website.hasOwnProperty('isDelete')) {
        delete website.isDelete;
      }
    });
    this.setId();
    this.pages.setWebsites(this.websites);
    this.getWebsites();
  }

  private deleteItem(group, isSplice: boolean) {
    const webs = group.websites;
    for (let i = webs.length - 1; i >= 0; i--) {
      if (isSplice) {
        if (!webs[i].id || webs[i].isDelete === true) {
          group.websites.splice(i, 1);
        }
      } else {
        if (!webs[i].id) {
          group.websites.splice(i, 1);
        }
      }
    }
  }

  private setId() {
    this.websites.forEach((group, g) => {
      group.id = g + 1;
      group.websites.forEach((item, i) => {
        item.id = group.id * 1000 + (i + 1);
      });
    });
  }
}
