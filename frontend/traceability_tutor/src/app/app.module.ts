import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {CustomSocketComponent} from './customization/custom-socket/custom-socket.component';

import {CustomConnectionComponent} from './customization/custom-connection/custom-connection.component';

import {DockComponent} from './ui/dock/dock.component';
import {MenubarModule} from 'primeng/menubar';
import {DialogModule} from 'primeng/dialog';
import {FileUploadModule} from 'primeng/fileupload';
import {FormsModule} from '@angular/forms';
import {KeyValuePipe, NgForOf, NgOptimizedImage} from '@angular/common';
import {ItemComponent} from './ui/items/item/item.component';
import {PanelModule} from 'primeng/panel';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SidebarModule} from 'primeng/sidebar';
import {SpeedDialModule} from 'primeng/speeddial';
import {ItemInfoViewComponent} from './ui/item-info-view/item-info-view.component';
import {SharedModule} from './shared/shared.module';
import {ReteModule} from 'rete-angular-plugin/17';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {ToastrModule} from 'ngx-toastr';
import {AuthComponent} from "./ui/auth/auth.component";
import {TabViewModule} from "primeng/tabview";
import {InputTextModule} from "primeng/inputtext";
import {EditorComponent} from "./ui/editor/editor.component";
import {CreateProjectFormComponent} from "./ui/forms/create-project.form/create-project.form.component";
import {EditorWrapperComponent} from './ui/editor-wrapper/editor-wrapper.component';
import {AppRoutingModule} from "./app-routing.module";
import {PageNotFoundComponent} from './ui/page-not-found/page-not-found.component';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AuthInterceptor} from "./interceptors/auth.interceptor";
import {APIInterceptor} from "./interceptors/api-interceptor";
import {CreateRelationshipFormComponent} from "./ui/forms/create-relationship-form/create-relationship-form.component";
import {CreateItemFormComponent} from "./ui/forms/create-item-form/create-item-form.component";

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent,
        CustomSocketComponent,
        CustomConnectionComponent,
        EditorComponent,
        ItemComponent,
        EditorWrapperComponent,
        PageNotFoundComponent,
    ],
    exports: [
        DockComponent
    ],
    imports: [
        BrowserModule,
        MenubarModule,
        DialogModule,
        FileUploadModule,
        FormsModule,
        KeyValuePipe,
        NgForOf,
        SharedModule,
        NgOptimizedImage,
        PanelModule,
        ItemInfoViewComponent,
        BrowserAnimationsModule,
        SidebarModule,
        SpeedDialModule,
        ReteModule,
        ProgressSpinnerModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        AuthComponent,
        TabViewModule,
        InputTextModule,
        CreateProjectFormComponent,
        AppRoutingModule,
        DockComponent,
        CreateRelationshipFormComponent,
        CreateItemFormComponent,
        CreateItemFormComponent,
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },

        {
            provide: HTTP_INTERCEPTORS,
            useClass: APIInterceptor,
            multi: true,
        },
        //{ provide: ErrorHandler, useClass: AppErrorHandler },
        //EventService
    ]
})
export class AppModule {
}
