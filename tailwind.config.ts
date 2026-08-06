
import animatePlugin from "tailwindcss-animate";
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    // These classes appear in colorMap objects (AnalysisSelector, StatisticsPanel)
    // accessed as dynamic lookups: colorMap[color]. Tailwind can't statically detect these.
    // blue
    'border-blue-200', 'bg-blue-50', 'text-blue-700', 'text-blue-400',
    // purple
    'border-purple-200', 'bg-purple-50', 'text-purple-700', 'text-purple-400',
    // green
    'border-green-200', 'bg-green-50', 'text-green-700', 'text-green-400',
    // orange
    'border-orange-200', 'bg-orange-50', 'text-orange-700', 'text-orange-400',
    // red
    'border-red-200', 'bg-red-50', 'text-red-700', 'text-red-400',
    // indigo
    'border-indigo-200', 'bg-indigo-50', 'text-indigo-700', 'text-indigo-400',
    // pink
    'border-pink-200', 'bg-pink-50', 'text-pink-700', 'text-pink-400',
    // amber (used in reliability badges + significance legends)
    'border-amber-200', 'bg-amber-50', 'text-amber-700', 'text-amber-400',
    // emerald (used in VERIFIED badges, significance)
    'border-emerald-200', 'bg-emerald-50', 'text-emerald-700', 'text-emerald-400',
    // cyan (used in some stat section badges)
    'border-cyan-200', 'bg-cyan-50', 'text-cyan-700',
    // violet
    'border-violet-200', 'bg-violet-50', 'text-violet-700',
    // rose
    'border-rose-200', 'bg-rose-50', 'text-rose-700',
    // Dark mode variants for the above (accessed via dark: in colorMap)
    'dark:bg-blue-900/10', 'dark:bg-purple-900/10', 'dark:bg-green-900/10',
    'dark:bg-orange-900/10', 'dark:bg-red-900/10', 'dark:bg-indigo-900/10',
    'dark:bg-pink-900/10', 'dark:bg-amber-900/10', 'dark:bg-emerald-900/10',
    'dark:bg-cyan-900/10', 'dark:bg-violet-900/10', 'dark:bg-rose-900/10',
    // fill- classes used in chart/heatmap components
    'fill-blue-200', 'fill-green-200', 'fill-purple-200', 'fill-amber-200',
    'fill-red-200', 'fill-emerald-200',
    // Other conditionally-constructed classes
    'font-serif-italic',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "pulse": {
          "0%, 100%": {
            opacity: "1"
          },
          "50%": {
            opacity: "0.7"
          }
        },
        "slide-in": {
          "0%": {
            transform: "translateX(-100%)"
          },
          "100%": {
            transform: "translateX(0)"
          }
        },
        "spin-slow": {
          "0%": {
            transform: "rotate(0deg)"
          },
          "100%": {
            transform: "rotate(360deg)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "spin-slow": "spin-slow 3s linear infinite"
      },
    },
  },
  plugins: [animatePlugin],
} satisfies Config;
