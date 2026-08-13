<<<<<<< HEAD
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
=======
import path from "node:path";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
>>>>>>> 5d688e1 (loginpage and passcode UI)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
<<<<<<< HEAD
    babel({ presets: [reactCompilerPreset()] })
  ],
})
=======
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
>>>>>>> 5d688e1 (loginpage and passcode UI)
