import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import {routesConfig} from "./users/routes-config";

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors({origin: true}));
routesConfig(app);

export const api = functions.https.onRequest(app);

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
