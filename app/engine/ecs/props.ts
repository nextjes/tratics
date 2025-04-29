export interface GenerateRequestsProps {
  algorithm: () => boolean;
  clientIds: string[];
  entryPointId: string;
  requestIdFactory: () => string;
  sizeFactory: () => number;
}
