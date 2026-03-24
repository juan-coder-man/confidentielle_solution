/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_confidentielle_MOCK?: string;
  readonly VITE_confidentielle_PUBLIC_KEY: string;
  readonly VITE_confidentielle_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
