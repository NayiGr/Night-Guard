import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DesktopPage} from '../pages/desktop/desktop.page';
import {NavigationPage} from '../pages/navigation/navigation.page';
import {EditPage} from '../pages/edit/edit.page';
import {SearchbarPage} from '../pages/searchbar/searchbar.page';
import {AlertPage} from '../pages/alert/alert.page';
import {PagesService} from '../pages/pages.service';

@NgModule({
  declarations: [
    AppComponent,
    DesktopPage,
    NavigationPage,
    EditPage,
    SearchbarPage,
    AlertPage
  ],
  entryComponents: [
    DesktopPage,
    NavigationPage,
    EditPage,
    SearchbarPage,
    AlertPage
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [PagesService],
  bootstrap: [AppComponent],
})
export class AppModule {
}
