const fs = require("fs");
const path = require("path");

const key = process.env.OWM_API_KEY ?? "";

const content = `export const environment = {
  production: true,
  owmApiKey: '${key}',
};
`;

const envDir = path.join(__dirname, "../src/environments");
fs.mkdirSync(envDir, { recursive: true });

fs.writeFileSync(path.join(envDir, "environment.prod.ts"), content);
fs.writeFileSync(path.join(envDir, "environment.ts"), content);

console.log("environment.ts e environment.prod.ts gerados.");
