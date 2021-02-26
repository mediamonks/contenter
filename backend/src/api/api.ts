import express from 'express';
import cors from 'cors';
import { createProject, getProjects, updateProjectMetadata } from './routes/project';
import { createUser } from './routes/user';

const app = express();

app.use(
  cors({
    origin: '*',
  })
);

app.get('/', (request, response) => {
  response.send('API is working');
});

app.get('/projects', getProjects);
app.put('/project', createProject);
app.patch('/project', updateProjectMetadata);

app.put('/user', createUser);

app.get('*', (request, response) => {
  response.status(404).send({
    success: false,
    message: 'Not found',
  });
});

export { app };
