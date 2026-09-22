import net from "node:net";

export async function checkTCP(address: string, port: number) {
  return new Promise<{status: "HEALTHY" | "DOWN"; latency: number | null;}>((resolve) => {
    const start = Date.now();

    const socket = new net.Socket();

    socket.setTimeout(5000);

    socket.connect(port, address, () => {
      const latency = Date.now() - start;

      socket.destroy();

      resolve({
        status: "HEALTHY",
        latency,
      });
    });

    socket.on("timeout", () => {
      socket.destroy();

      resolve({
        status: "DOWN",
        latency: null,
      });
    });

    socket.on("error", () => {
      socket.destroy();

      resolve({
        status: "DOWN",
        latency: null,
      });
    });
  });
};