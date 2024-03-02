import { Hono } from 'hono';
import { cors } from 'hono/cors'
import { clientRouter } from './route/client';

export const app = new Hono<{
  Bindings: {
    
  }
}>();

app.use(
  '/*',
  cors({
    origin: `*`,
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'HEAD', 'PUT', 'PATCH', 'DELETE'],
    exposeHeaders: ['Content-Length', 'Authorization'],
    maxAge: 600,
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.json({
    message: "OK",
    timestamp: Date.now(),
  });
});

app.get("/_health", (c) => {
  return c.json({
    message: "OK",
    timestamp: Date.now(),
  });
});

app.route('/api/v1/client', clientRouter)


export default app;
