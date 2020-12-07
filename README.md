# Example FAIRified data portal

This is a demonstration proof-of-concept microservice developed as part of the master thesis _"Open dat in scientific research"_ by [Ondřej Doktor](https://www.ondrejdoktor.cz) at the [Institute of applied informatics](https://www.prf.jcu.cz/en/uai), Faculty of Science, University of South Bohemia in České Budějovice, Czech Republic.

Goal of this thesis is to investigate practical aspects of [FAIRification](https://www.go-fair.org/fair-principles/fairification-process/) in relation to the existing scientific data resources which are being produced at the faculty, suggest processes and best-practices for doing so, and demonstrate successful application of these by implementing them on a simplified dataset, which is based on real data.

The output You are looking at is produced by the microservice solving this goal. This work is closely related to the [UniCatDB project](https://www.unicatdb.org) - Universal Catalog Database for biological findings.

**Please note that the data presented are for demonstration purposes only and NOT scientifically valid in any way!**

---

**Live demo:** http://purl.org/dktr/fair

---

## Getting started with development

## Prerequisites

Required:
- latest [Docker Desktop](https://www.docker.com/products/docker-desktop)
- a decent IDE (JetBrains WebStorm or VS Code with Remote-WSL extension is recommended)

Recommended on your host machine:
- [Node.js](https://nodejs.org/en/) 14+ (LST recommended)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/getting-started/install) (latest) according to your preference

_* Node and npm are technically not needed on your host machine since the development is
done inside the container, but are necessary, and thus recommend, for any code completion and TypeScript
static code check to work._

For development on Windows platform:
- Do your development inside WSL environment (WSL2 is recommended, [installation guide](https://docs.microsoft.com/en-us/windows/wsl/install-win10),
[learn more](https://dev.to/johnbwoodruff/far-more-epic-development-environment-using-wsl-2-439g) about the technology if it's new to you)
    - ... or have ported GNU `make` command installed, e.g. GnuWin32 (generally not recommended for many incompatibilities)
- Pay attention to line endings if developing outside of the WSL - keep LF instead of CRLF.

### First steps

1. Download / clone repository and `cd` to root folder
2. _(recommended)_ Install packages for IDE code completion (InteliSense) `npm install` or `yarn install`
3. Run application in with dev configuration `make run-dev` or `docker-compose up --build`
4. Open web browser and navigate to http://localhost:8081
5. _(optional)_ Attach remote Node.js/Chrome debugger to port TCP 9229 (web app) and TCP 9230 (CLI app) 

After verifying the app runs, import provided mock data by running `make import`.

### Run and use CLI in interactive mode

1. Make sure the app is running (`make run-dev`)
2. Run the CLI `make cli`
3. The CLI will open-up in your terminal, type `help` to see available commands:


```
app-cli$ help

  Commands:

    help [command...]                   Provides help for a given command.
    exit                                Exits application.
    import [options] [csv] [semantics]  Imports data from CSV according to given JSON or 
    	YAML semantic description

app-cli$ help import

  Usage: import [options] [csv] [semantics]

  Imports data from CSV according to given JSON or YAML semantic description

  Options:

    --help       output usage information
    -g <column>  Use GUID from column of data
```

## Build for production

1. Adjust settings in `<repo root>/env/production.env`, most importantly the `IRI_PREFIX_OF_SELF` variable to match the base URL
of the environment which will be the app deployed to.
3. (optional) Prepare demo data, or delete the file `<repo root>/data/MockDb.json` to start fresh.
2. Manually adjust the build version of the container in `Makefile` under the `build-prod` section.
3. Run `make build-prod`.
4. Optionally check the build by running it `make run-prod`.



