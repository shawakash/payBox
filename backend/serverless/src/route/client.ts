import { Hono } from "hono";

export const clientRouter = new Hono<{
    Bindings: {

    }
}>();

clientRouter.post('/', async (c) => {
    
});