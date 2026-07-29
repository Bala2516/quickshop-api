import { createDatabase, createTables } from "./schema.js";

const setup = async () => {
  try {
    await createDatabase();
    await createTables();

    console.log("Setup completed");
  } catch (error) {
    console.error("Setup failed:", error.message);
    process.exit(1);
  }
};

setup();