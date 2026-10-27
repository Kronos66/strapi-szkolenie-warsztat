import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Wbudowany serwer MCP (Strapi 5.47+) — endpoint /mcp, uwierzytelnianie Admin Tokenem
  mcp: {
    enabled: env.bool('MCP_ENABLED', true),
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
});

export default config;
