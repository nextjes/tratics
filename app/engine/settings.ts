import { Router } from "./router";

export let router: Router | null = null;

export function initializeRouter() {
  router = Router.config([
    ["client-1", "server-1"],
    ["server-1", "client-1"],
  ]);
}
