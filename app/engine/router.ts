import { error } from "~/engine";
import * as network from "~/engine/core/network";
export class Router {
  readonly links: Map<string, network.NetworkLink>;

  private constructor(linkMap: Map<string, network.NetworkLink>) {
    this.links = linkMap;
  }

  public static config(links: [srcId: string, dstId: string][]): Router {
    const linkMap = links.reduce((map, [srcId, dstId]) => {
      const link = network.NetworkLink.connect(srcId, dstId);
      map.set(`${srcId}-${dstId}`, link);
      return map;
    }, new Map<string, network.NetworkLink>());
    return new Router(linkMap);
  }

  public route(message: network.Message): void {
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
