import express from 'express';
import cors from 'cors';
import { createProject } from './routes/createProject';

const app = express();

app.use(
  cors({
    origin: [
      'https://mm-content-manager.firebaseapp.com/',
      'https://mm-content-manager.web.com/',
      'https://dev-mm-content-manager.firebaseapp.com/',
      'https://dev-mm-content-manager.web.com/',
      'localhost',
    ],
  })
);

app.get('/', (request, response) => {
  response.send('API is working');
});

app.post('/create-project', createProject);

app.get('*', (request, response) => {
  response.status(404).send('Not Found');
});

export { app };
