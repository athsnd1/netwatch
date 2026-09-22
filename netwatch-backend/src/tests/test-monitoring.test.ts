import { monitorDevice } from "../services/monitoring/monitoring.service.js";

const result = await monitorDevice({
  address: "192.168.50.211",
  type: "PRINTER",
  community: "public",
});

console.dir(result, {
  depth: null,
});