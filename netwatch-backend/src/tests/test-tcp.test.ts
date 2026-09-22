import { checkTCP } from "../services/monitoring/tcp.service.js";

const result = await checkTCP("127.0.0.1", 3000);

console.log(result);