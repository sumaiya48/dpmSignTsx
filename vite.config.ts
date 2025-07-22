import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		hmr: {
			overlay: true,
		},
		port: 9090,
	},
	optimizeDeps: {
		include: ["embla-carousel-react"],
		exclude: ["lucide-react"],
	},
});
