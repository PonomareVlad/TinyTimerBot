import {Bot} from "grammy";
import {promisify} from "util";
import {token, timerLimit} from "./data.mjs";

const wait = promisify((a, f) => setTimeout(f, a));

export const bot = new Bot(token);

bot.command("seconds", ctx => {
    const seconds = parseInt(ctx.match.trim());
    return checkValue(ctx, seconds) || runTimer(ctx, seconds);
});

bot.command("minutes", ctx => {
    const minutes = parseInt(ctx.match.trim());
    return checkValue(ctx, minutes) || runTimer(ctx, minutes * 60);
});

bot.command("hours", ctx => {
    const hours = parseInt(ctx.match.trim());
    return checkValue(ctx, hours) || runTimer(ctx, hours * 60 * 60);
});

bot.on("message:text", ctx => {
    const message = [
        "You can set timer following this examples:",
        "",
        "`/seconds 30` — for half of minute",
        "`/minutes 15` — for quarter of an hour",
    ]
    return ctx.reply(message.join("\r\n"), {parse_mode: "Markdown"});
});

async function runTimer(ctx, seconds) {
    let controller = new AbortController();
    if (seconds > timerLimit) seconds = timerLimit;
    const {message_id: reply_to_message_id} = ctx.msg;
    console.log(`[${reply_to_message_id}]`, `Timer for:`, seconds, "seconds started...");
    const {message_id, chat: {id}} =
        await ctx.reply(getTimerMessage(seconds), {reply_to_message_id});
    const interval = setInterval(() => {
        try {
            seconds -= 1;
            if (seconds < 0)
                return clearInterval(interval);
            controller.abort();
            controller = new AbortController();
            ctx.editMessageText(
                getTimerMessage(seconds),
                {message_id},
                controller.signal
            ).catch(console.error);
        } catch (e) {
            console.error(e);
        }
    }, 1000);
    await wait(1000 * seconds);
    clearInterval(interval);
    await ctx.reply("Time is up !", {reply_to_message_id});
    console.log(`[${reply_to_message_id}]`, `Timer for:`, seconds, "seconds complete !");
    return ctx.api.deleteMessage(id, message_id);
}

function getTimerMessage(seconds) {
    const time = new Date(seconds * 1000).toISOString().substring(11, 19).split(":");
    const segments = time.reduce((time, segment) => segment === "00" && !time.length ? time : [...time, segment], []);
    return `⏳ ${segments.join(":") || "00"} \r\n\r\nYou will be notified when the timer ends`;
}

function checkValue(ctx, value) {
    if (isNaN(value) || value < 1) {
        const {message_id: reply_to_message_id} = ctx.msg;
        return ctx.reply("Please use integer numbers without spaces", {reply_to_message_id});
    }
}
