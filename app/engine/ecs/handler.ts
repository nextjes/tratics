import type { CreateRequest } from "./command";
import type { GenerateRequestsProps } from "./props";

export function generateRequests({
  algorithm,
  clientIds,
  entryPointId,
  requestIdFactory,
  sizeFactory,
}: GenerateRequestsProps): CreateRequest[] {
  return clientIds
    .map((clientId) => {
      if (algorithm()) {
        return {
          type: "create",
          requestId: requestIdFactory(),
          srcId: clientId,
          dstId: entryPointId,
          size: sizeFactory(),
        };
      }
      return null;
    })
    .filter((cmd): cmd is CreateRequest => cmd !== null);
}
