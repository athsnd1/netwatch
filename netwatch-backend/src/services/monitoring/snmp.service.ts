import snmp, { type Varbind } from "net-snmp";
import type { SNMPCheckResult } from "../../types/monitoring.js";

export interface SNMPConsumable {
  index: number;
  name: string;
  unit: number;
  maxLevel: number;
  level: number;
}

export async function checkSNMP(
  address: string,
  oid: string,
  community = "public"
): Promise<SNMPCheckResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    let session: snmp.Session | null = null;
    let resolved = false;

    try {
      session = snmp.createSession(address, community, {
        timeout: 5000,
        retries: 1,
      });

      // Handle error events from the session
      session.on('error', (error: Error) => {
        if (!resolved) {
          resolved = true;
          if (session) {
            try {
              session.close();
            } catch (e) {
              // Ignore close errors
            }
          }
          resolve({
            status: "DOWN",
            latency: null,
          });
        }
      });

      session.get([oid], (error: Error | null, varbinds: Varbind[] | undefined) => {
        if (resolved) return;
        resolved = true;

        if (session) {
          try {
            session.close();
          } catch (e) {
            // Ignore close errors
          }
        }

        if (error) {
          resolve({
            status: "DOWN",
            latency: null,
          });
          return;
        }

        resolve({
          status: "HEALTHY",
          latency: Date.now() - start,
          value: varbinds && varbinds[0] ? varbinds[0].value : undefined,
        });
      });

      // Add timeout to prevent hanging
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (session) {
            try {
              session.close();
            } catch (e) {
              // Ignore close errors
            }
          }
          resolve({
            status: "DOWN",
            latency: null,
          });
        }
      }, 6000); // Slightly longer than the SNMP timeout

    } catch (error) {
      if (!resolved) {
        resolved = true;
        if (session) {
          try {
            session.close();
          } catch (e) {
            // Ignore close errors
          }
        }
        resolve({
          status: "DOWN",
          latency: null,
        });
      }
    }
  });
};

export async function walkSNMP(
  address: string,
  oid: string,
  community = "public"
) {
  return new Promise<Varbind[]>((resolve, reject) => {
    let session: snmp.Session | null = null;
    let resolved = false;
    const varbinds: Varbind[] = [];

    try {
      session = snmp.createSession(address, community, {
        timeout: 5000,
        retries: 1,
      });

      // Handle error events from the session
      session.on('error', (error: Error) => {
        if (!resolved) {
          resolved = true;
          if (session) {
            try {
              session.close();
            } catch (e) {
              // Ignore close errors
            }
          }
          reject(error);
        }
      });

      session.subtree(
        oid,
        (varbindsBatch: Varbind[]) => {
          // net-snmp yields an array of varbinds per batch
          for (const vb of varbindsBatch) {
            if (!snmp.isVarbindError(vb)) {
              varbinds.push(vb);
            }
          }
        },
        (error: Error | null) => {
          if (resolved) return;
          resolved = true;

          if (session) {
            try {
              session.close();
            } catch (e) {
              // Ignore close errors
            }
          }

          if (error) {
            reject(error);
            return;
          }

          resolve(varbinds);
        }
      );

      // Add timeout to prevent hanging
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (session) {
            try {
              session.close();
            } catch (e) {
              // Ignore close errors
            }
          }
          reject(new Error('SNMP walk timeout'));
        }
      }, 10000); // Longer timeout for walk operations

    } catch (error) {
      if (!resolved) {
        resolved = true;
        if (session) {
          try {
            session.close();
          } catch (e) {
            // Ignore close errors
          }
        }
        reject(error);
      }
    }
  });
};
