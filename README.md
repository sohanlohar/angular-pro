# POS Engineering test

## Do Not Update or Modify the Mentioned DevOps related files and directories in the repo 

```
Directory: k8s_deployments 
.gitlab-ci.yml
 k8s_auth.sh
```


## TO Deploy D02 env

1. Please create an Tag d02-(any extention you wish to add)
2. Push the Tag pipeline whill get trigger and deploy to d02 env

For more information Please [CLICK HERE](https://pos-malaysia.atlassian.net/wiki/spaces/PD/pages/280297708/SPP-D02+GitLab+CI)


### Rebuild & run program
```
## Setup

This project requires the following tools in order to build and run the project:

- Nodejs (version 16)
- Angular CLI

Angular CLI will be a wrapper to all nx commands. Nx installation is not necessary.
`nx serve` will be similar to `ng serve`

## How To Start
Command: 
```bash
npx nx serve ezisend
```

## How To Start with Different Port
Command: 
```bash
npx nx serve ezisend --port=46000
```

### Building a project

Example: `ezisend`

```bash
npx ng build ezisend
```

Note:
You can also use `ng build ezisend` if you have Angular CLI installed

Command above will output the build files to the following location:

```bash
dist/apps/ezisend/
├── 3rdpartylicenses.txt
├── 43.47da22e9aa0f9496.js
├── 700.2072735346a10e2f.js
├── 896.92078a9829cb842a.js
├── assets
│   ├── pos-logo.svg
│   └── sendPro-logo.svg
├── favicon.ico
├── index.html
├── main.f767a0e87445347a.js
├── polyfills.698ecf0c5ee079f7.js
├── runtime.a90e46593544fa13.js
└── styles.19a80574db0def96.css
```

Note: Contents of the project folder name should be deployed. In this example, it will be the content of `ezisend` folder.

## Nx Quick Start & Documentation

[Nx Documentation](https://nx.dev/angular)

### Adding capabilities to workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below is the angular plugin:

- [Angular](https://angular.io)
  - `ng add @nrwl/angular`

### Generate an application

Run `ng g @nrwl/angular:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

### Generate a library

Run `ng g @nrwl/angular:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@pos/mylib`.

### Development server

Run `ng serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng g component my-component --project=my-app` to generate a new component.

### Build

Run `ng build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `ng e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace

Run `nx graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev/angular) to learn more.
