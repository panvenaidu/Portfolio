import { defineConfig } from 'vite';
import { readdirSync, cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
export default defineConfig({
  build: { rollupOptions: { input: { main: resolve('index.html'), workroom: resolve('scrollcraft.html'), ...Object.fromEntries(readdirSync('projects').filter(f => f.endsWith('.html')).map(f => [f.replace('.html',''), resolve('projects',f)])) } }, chunkSizeWarningLimit: 600 },
  plugins: [{ name: 'portfolio-documents', closeBundle() { for (const path of ['Certs','Panvee_Naidu_Resume.pdf']) if(existsSync(path)) cpSync(path,`dist/${path}`,{recursive:true}); } }],
  server: {port:5173,strictPort:true}, preview: {port:4173,strictPort:true}
});
