import {bot} from "../src/bot.mjs";
import {secretToken} from "../src/data.mjs";
import {webhookCallback} from "grammy";

export const config = {runtime: "edge"};

export default webhookCallback(bot, "std/http", {
    timeoutMilliseconds: 24_900,
    onTimeout: "return",
    secretToken,
});
