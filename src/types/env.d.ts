declare namespace NodeJS {
  interface ProcessEnv {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
