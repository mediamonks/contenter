import express from 'express';
import cors from 'cors';
import { helloWorld } from './routes/helloWorld';

const app = express();

app.use(cors({ origin: '*' }));

app.get('/', (request, response) => {
  response.send('API is working');
});

app.get('/hello-world', helloWorld);

app.get('*', (request, response) => {
  response.status(404).send('Not Found');
});

export { app };
