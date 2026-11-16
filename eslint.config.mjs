import { globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import nextTs from 'eslint-config-next/typescript.js';
export default [...nextVitals, ...nextTs, globalIgnores(['.next/**', 'next-env.d.ts'])];
