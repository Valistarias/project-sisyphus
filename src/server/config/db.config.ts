export default {
  url: env =>
    `mongodb+srv://${env.DB_USER}:${env.DB_PASS}@ncpdblue.sy84gj1.mongodb.net/sisyphus?retryWrites=true&w=majority&appName=NCPDBlue`,
  secret: env => env.SECRET_TOKEN ?? process.env.SECRET_TOKEN ?? null
};
