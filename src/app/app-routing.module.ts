import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DesktopPage} from '../pages/desktop/desktop.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'index.html',
    pathMatch: 'full',
  },
  {
    path: 'index.html',
    component: DesktopPage,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
