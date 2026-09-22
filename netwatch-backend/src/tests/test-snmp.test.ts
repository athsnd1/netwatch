import { walkSNMP } from "../services/monitoring/snmp.service.js";

const results = await walkSNMP(
  "192.168.10.1",
  "1.3.6.1.2.1.2.2.1",
  "public"
);

for (const item of results) {
  console.log(
    item.oid,
    Buffer.isBuffer(item.value)
      ? item.value.toString()
      : item.value
  );
}