import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { generateCSPHeader, SECURITY_HEADERS } from './src/utils/security-headers';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: mode === 'development' ? {
      ...SECURITY_HEADERS,
      'Content-Security-Policy': generateCSPHeader()
    } : {}
  },
  preview: {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Security-Policy': generateCSPHeader()
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Security optimizations
    sourcemap: false, // Don't expose source maps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Obfuscate chunk names for security
        chunkFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        entryFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        assetFileNames: mode === 'production' ? 'assets/[hash].[ext]' : 'assets/[name]-[hash].[ext]'
      }
    }
  },
  define: {
    // Ensure we don't leak sensitive env vars
    'process.env.NODE_ENV': JSON.stringify(mode),
    // Only expose safe public variables
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
}));
