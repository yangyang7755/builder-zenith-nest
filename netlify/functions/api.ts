import serverless from "serverless-http";
import { createServer } from "../../server/index";

// Note: Socket.IO real-time features won't work with serverless functions
// For full real-time chat, deploy the server separately with Socket.IO
export const handler = serverless(createServer());
