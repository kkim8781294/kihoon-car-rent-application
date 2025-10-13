import app from './app';
import { connectMongo } from './infrastructure/mongodb/mongoDbConnection';
import { ENV } from './config/config';


connectMongo()
.then(() => {
    app.listen(ENV.PORT, () => {
        console.log(JSON.stringify({ level: 'info', event: 'server.started', port: ENV.PORT }));
        console.log(`Now listening on http://localhost:${ENV.PORT}`);
    });
  }).catch((e: any) => {
    console.error(JSON.stringify({ level: 'error', event: 'mongo.connect.failure', error: e?.message }));
    process.exit(1);
  });