const fs = require("fs");
const path = require("path");

const key = process.env.OWM_API_KEY ?? "";

const content = `export const environment = {
  production: true,
  owmApiKey: '${key}',
};
`;

fs.mkdirSync(path.join(__dirname, "../src/environments"), { recursive: true });
fs.writeFileSync(
  path.join(__dirname, "../src/environments/environment.prod.ts"),
  content,
);
console.log("environment.prod.ts gerado.");
