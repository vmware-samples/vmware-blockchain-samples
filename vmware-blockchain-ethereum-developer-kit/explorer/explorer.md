# (WIP) VMBC Explorer

## VMBC URL Config For Dev Mode

Change the VMBC URL in `src/assets/vmbc.json` file  **but don't commit**

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.11.

## Development server
Run `npm install` to install dependencies.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Dockerise

To build `docker build -t vmbc-explorer:latest .`

To export Image `docker save -o vmbc-explorer.tar vmbc-explorer:latest`

To load docker image `docker image load -i vmbc-explorer.tar`

To Execute `docker run -d -p 80:80 --rm --name vmbc-explorer-1 -e VMBC_URL=<url> vmbc-explorer:latest`
## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.
