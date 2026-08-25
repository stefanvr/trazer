// Application entry.
//
// Deliberately minimal: this exists to prove the pipeline end to end — build, test, deploy, and a
// live page that can be checked against `main` — not to be the beginning of a user interface. The
// first real screen arrives with a goal that has a journey behind it.

import { buildInfo, formatBuildInfo } from "./build-info";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app is missing from index.html");

app.innerHTML = `
  <main>
    <h1>{{PROJECT_NAME}}</h1>
    <p>The skeleton is deployed. Replace this with the first thing worth looking at.</p>
    <p class="build" data-testid="build-info">${formatBuildInfo(buildInfo())}</p>
  </main>
`;
