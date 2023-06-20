import {bot} from "../src/bot.mjs";
import {secretToken} from "../src/data.mjs";
import {webhookStream} from "vercel-grammy/edge.mjs";

export const config = {runtime: "edge"};

export default webhookStream(bot, {
    timeoutMilliseconds: 16 * 60 * 1000,
    onTimeout: "return",
    secretToken,
});
