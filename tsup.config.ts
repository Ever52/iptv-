import { defineConfig } from "tsup"

export const tsup = defineConfig({
    entry: ["src/main.ts"],
    outDir: "dist",
    clean: true,
    format: ["esm"],
})
