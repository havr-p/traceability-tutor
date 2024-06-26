import {Component} from '@angular/core';

@Component({
    template: `
    <!DOCTYPE html>
    <html lang="en">


    <head>
      <meta charset="UTF-8"/>
      <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Traceability Tutor</title>
    </head>


    <body>
    <div class="d-flex align-items-center justify-content-center vh-100">
      <div class="text-center">
        <h1 class="display-1 fw-bold">404</h1>
        <p class="fs-3"><span class="text-danger">Opps!</span> Page not found.</p>
        <p class="lead">
          The page you’re looking for doesn’t exist.
        </p>
        <a [routerLink]="'/projects'" class="btn btn-primary">Go to projects menu</a>
      </div>
    </div>
    </body>


    </html>
  `,
    styles: ``
})
export class PageNotFoundComponent {

}
