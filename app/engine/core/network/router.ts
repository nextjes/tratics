import { error } from "~/engine";
import type { NetworkLink } from "./link";
import type { Message } from "./message";

export class Router {
  readonly links: Map<string, NetworkLink>;

  private constructor(linkMap: Map<string, NetworkLink>) {
    this.links = linkMap;
  }

  public static config(links: NetworkLink[]): Router {
    const linkMap = links.reduce((map, link) => {
      map.set(`${link.srcId()}-${link.dstId()}`, link);
      return map;
    }, new Map<string, NetworkLink>());
    return new Router(linkMap);
  }

  public route(message: Message): void {
    const linkKey = `${message.srcId()}-${message.dstId()}`;
    const link = this.links.get(linkKey);
    if (!link) {
      throw new error.NotFoundError(
        `No link found for ${message.srcId()} to ${message.dstId()}`
      );
    }

    this.links.set(linkKey, link.transmit(message));
  }
}
