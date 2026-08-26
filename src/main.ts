// Application entry — [IS-1.1].
//
// Finds the mount point and hands over to the shell. Everything else lives behind that call: the
// rules in src/domain, the wiring in src/ui/app.ts. This file exists to fail loudly if the page it
// is served into is not the page it expects.

import { mountApp } from "./ui/app";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app is missing from index.html");

mountApp(app);
