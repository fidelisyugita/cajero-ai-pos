import type { Config } from "drizzle-kit";
export default {
	schema: "./db/schema.ts",
	out: "./db/migrations",
	driver: "expo",
	dialect: "sqlite",
	dbCredentials: {
		url: "./db/",
	},
} satisfies Config;
