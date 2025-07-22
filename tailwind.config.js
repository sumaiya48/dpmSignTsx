/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html", // Add this line to cover the main HTML file
		"./src/**/*.{js,ts,jsx,tsx}", // Ensure you cover all React files
	],
	theme: {
		extend: {
			fontFamily: {
				poppins: ["Poppins", "sans-serif"],
			},
			colors: {
				skyblue: "#24A9E2",
				darkblue: "#2C3691",
				yellow: "#FEB92C",
				red: "#FD1E1E",
				gray: "#8F8F8F",
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground":
						"hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground":
						"hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
					"primary-foreground":
						"hsl(var(--sidebar-primary-foreground))",
					"accent-foreground":
						"hsl(var(--sidebar-accent-foreground))",
				},
			},
			backgroundImage: {},
			width: {
				100: "30rem",
				"row-sm": "calc(100% - 2rem)",
				row: "calc(100% - 8rem)",
			},
			height: {
				"0-2rem": "0.2rem",
			},
			borderWidth: {
				"2rem": "0.125rem",
				"1rem": "0.1rem",
				"1-2rem": "0.120rem",
			},
			lineHeight: {
				12: "4rem",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: {
						height: "0",
					},
					to: {
						height: "var(--radix-accordion-content-height)",
					},
				},
				"accordion-up": {
					from: {
						height: "var(--radix-accordion-content-height)",
					},
					to: {
						height: "0",
					},
				},
				"fade-in": {
					"0%": { opacity: 0, transform: "scale(0.95)" },
					"100%": { opacity: 1, transform: "scale(1)" },
				},
				wave: {
					"0%, 100%": { height: "10px" },
					"50%": { height: "50px" },
				},
				"caret-blink": {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.2s ease-out",
				wave: "wave 1s ease-in-out infinite",
				"caret-blink": "caret-blink 1s infinite",
			},
			animationDelay: {
				100: "0.1s",
				200: "0.2s",
				300: "0.3s",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
