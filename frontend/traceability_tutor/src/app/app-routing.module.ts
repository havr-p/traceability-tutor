import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {EditorComponent} from "./ui/editor/editor.component";
import {AuthComponent} from "./ui/auth/auth.component";
import {EditorWrapperComponent} from "./ui/editor-wrapper/editor-wrapper.component";
import {PageNotFoundComponent} from "./ui/page-not-found/page-not-found.component";

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'editor', component: EditorWrapperComponent},
  { path: '', redirectTo: '/auth', pathMatch: 'full' }, //login redirect by default
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
