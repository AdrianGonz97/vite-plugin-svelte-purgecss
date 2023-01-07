import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	splitting: false,
	sourcemap: true,
	clean: true,
	format: ["esm", "cjs"],
	dts: true,
	outDir: "dist",
	tsconfig: "tsconfig.json",
});
