# Frontend

## First time setup

Install packages using package manager

```
npm install
```

## Get started

Run the dev server:

```
npm run dev
```

In order to interact with the other services, run `skaffold dev` in the services folder. There's also the option to run the frontend from $PROJECT_DOMAIN but you'll not benefit from the benefits of live reloading etc. provided by the vite dev server.

## Decisions

Here I'll write a few notes on the decisions made so far to help new people understand what's going on in the codebase.

Basically the frontend is a React app (frontend framework) using Vite as the build tool (development environment).

Routing doesn't come built in in React, so we're using the `@tanstack/react-location` package.

Additionally global state management (useful for sites that have authencation as an example) is a bit cumbersome in React without a library, so I've pulled in another package called `zustand`.

The rest is vanilla React.

So far styling is done using vanilla CSS. Create a CSS file, put your CSS in the file and import into the component that needs it (example check the Login page inside pages).

More to come here!
