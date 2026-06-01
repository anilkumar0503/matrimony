import { startImageWorker } from "./image-processor";

export function startAllWorkers() {
  startImageWorker();
  console.log("✓ BullMQ workers started");
}

if (require.main === module) {
  startAllWorkers();
}
