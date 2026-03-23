import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getEnv = () => {
  const cliArgs = process.argv.slice(2);
  const envKey = (cliArgs[0] || "local").toLowerCase();

  switch (envKey) {
    case "local":
      return { code: "local", name: "Localhost" };
    case "dev":
      return { code: "dev", name: "Development" };
    case "test":
      return { code: "test", name: "Test" };
    case "stg":
      return { code: "stg", name: "Staging" };
    case "prod":
      return { code: "prod", name: "Production" };
    default:
      console.warn(`Unknown environment "${envKey}", defaulting to local.`);
      return { code: "local", name: "Localhost" };
  }
};

const setupConfig = async (env) => {
  try {
    const configPath = path.join(
      __dirname,
      `./src/config/env/${env.code}.json`,
    );
    const rawData = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(rawData);

    config.env = env;

    const configFile = `
const config = ${JSON.stringify(config, null, 2)};
export default config;
`;

    const filepath = path.join(__dirname, "src/config/env/default.js");
    fs.writeFileSync(filepath, configFile);
    console.log("Configuration file generated");
  } catch (error) {
    console.error("Error loading config:", error);
    throw error;
  }
};

// main
const init = async () => {
  try {
    const env = getEnv();
    await setupConfig(env);
  } catch (err) {
    console.error("Error while building config:", err);
  }
};

init();
