import {bot} from "../src/bot.mjs";
import {prefix, secretToken} from "../src/data.mjs";
import {setWebhookCallback} from "vercel-grammy";

export const config = {runtime: "edge"};

export default setWebhookCallback(bot, {
    secret_token: secretToken,
    catchErrors: true,
    prefix,
});
