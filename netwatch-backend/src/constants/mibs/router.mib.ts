export const ROUTER_MIB = {
  system: {
    description: "1.3.6.1.2.1.1.1.0",
    objectId: "1.3.6.1.2.1.1.2.0",
    uptime: "1.3.6.1.2.1.1.3.0",
    name: "1.3.6.1.2.1.1.5.0",
    location: "1.3.6.1.2.1.1.6.0",
  },

  interfaces: {
    base: "1.3.6.1.2.1.2.2.1",
  },

  resources: {
    storage: {
      base: "1.3.6.1.2.1.25.2.3.1",
    },

    processor: {
      base: "1.3.6.1.2.1.25.3.3.1",
    },
  },
} as const;