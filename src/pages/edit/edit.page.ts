import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {PagesService} from '../pages.service';

@Component({
  selector: 'edit-page',
  templateUrl: 'edit.page.html',
  styleUrls: ['edit.page.scss']
})

export class EditPage implements OnInit {
  public website: any;
  public websites: Array<any> = [];
  public currGroup: any;
  public isBackdrop: boolean;
  public isToast: boolean;
  private imageName: string;
  @Output() outEdit: EventEmitter<any> = new EventEmitter<any>();

  constructor(private pages: PagesService) {
  }

  ngOnInit(): void {
    this.isToast = true;
    this.imageName = '添加图标';
    this.currGroup = this.pages.getItem().group;
    this.website = JSON.parse(JSON.stringify(this.pages.getItem().website));
    this.websites = JSON.parse(JSON.stringify(this.pages.getEditWebsites()));
    setTimeout(() => {
      this.isBackdrop = this.pages.getBackdrop();
    }, 50);
    this.ableSave();
  }

  public change(event) {
    this.imageName = event.target.files[0].name;
    const imgFile = new FileReader();
    if (event.target.files[0]) {
      imgFile.readAsDataURL(event.target.files[0]);
      imgFile.onload = (ev: any) => {
        this.website.icon = ev.currentTarget.result;
      };
    }
  }

  public inputUrl(event) {
    const domain = event.split('/');
    if (domain[2]) {
      this.website.icon = `${domain[0]}//${domain[2]}/favicon.ico`;
      const favicon = document.getElementById('favicon');
      favicon.onerror = () => {
        this.website.icon = '';
      };
    }
    this.ableSave();
  }

  public ableSave() {
    if (this.website.name || this.website.url || this.website.icon) {
      this.isToast = false;
    } else {
      this.isToast = true;
    }
  }

  public async save(isSave: boolean, website?: any) {
    if (isSave) {
      this.ableSave();
      const currId = {groupId: this.currGroup.id, websiteId: website.id};
      this.addDataId(website);
      this.pages.setWebsites(this.websites);
      this.pages.setEditWebsites(this.websites);
      const params = {
        group: {id: this.currGroup.id, type: currId.groupId ? 'edit' : 'add'},
        website: {id: website.id, type: currId.websiteId ? 'edit' : 'add'},
      };
      this.outEdit.emit({name: 'save', value: params});
    }
    this.outEdit.emit({name: 'backdrop', value: false});
  }

  private addDataId(website) {
    if (!this.currGroup.id) {
      this.currGroup.id = this.websites.length >= 2 ? this.websites[this.websites.length - 2].id + 1 : 1;
      this.websites[this.websites.length - 1] = {
        id: this.currGroup.id,
        title: this.currGroup.name,
        websites: [website]
      };
    }
    for (const group of this.websites) {
      if (group.id === this.currGroup.id) {
        group.title = this.currGroup.name;
        if (website.id) {
          group.websites.forEach((web, index) => {
            if (web.id === website.id) {
              group.websites[index] = website;
            }
          });
        } else {
          const webs = group.websites;
          website.id = group.id * 1000 + webs.length;
          webs[webs.length - 1] = website;
          break;
        }
      }
    }
  }
}
