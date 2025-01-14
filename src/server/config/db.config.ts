const url = (env: {
  DB_USER: string
  DB_PASS: string
}): string =>
  `mongodb+srv://${env.DB_USER}:${env.DB_PASS}@ncpdblue.sy84gj1.mongodb.net/sisyphus?retryWrites=true&w=majority&appName=NCPDBlue`;

const secret = (env: NodeJS.ProcessEnv): string | null =>
  env.SECRET_TOKEN ?? null;

export default {
  url,
  secret
};
