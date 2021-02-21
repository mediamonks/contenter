import express from 'express';
import cors from 'cors';
import { createProject, updateProjectMetadata } from './routes/project';
import { createUser } from './routes/user';

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

app.post('/project/create', createProject);
app.post('/project/updateMetadata', updateProjectMetadata);

app.post('/user/create', createUser);

app.get('*', (request, response) => {
  response.status(404).send({
    success: false,
    message: 'Not found',
  });
});

export { app };
