import { Hono } from "hono";

export const clientRouter = new Hono<{
    Bindings: {
    
    }
}>();

clientRouter.get('/', async (c) => {
    return c.text('Hello, World!');
});