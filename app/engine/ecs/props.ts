export interface GenerateRequestsProps {
  algorhythm: () => boolean;
  clientIds: string[];
  entryPointId: string;
  requestIdFactory: () => string;
  sizeFactory: () => number;
}
