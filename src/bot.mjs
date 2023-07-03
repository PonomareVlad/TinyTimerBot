import {Bot} from "grammy";
import {promisify} from "util";
import {token, botInfo, timerLimit} from "./data.mjs";

const wait = promisify((a, f) => setTimeout(f, a));

export const bot = new Bot(token, {botInfo});

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
        "",
        "Please note that this bot is currently in demo mode and is hard limited to 15 minutes for any timers.",
    ]
    return ctx.reply(message.join("\r\n"), {parse_mode: "Markdown"});
});

async function runTimer(ctx, seconds) {
    let controller = new AbortController();
    if (seconds > timerLimit) seconds = timerLimit;
    const {message_id: reply_to_message_id} = ctx.msg;
    const {message_id, chat: {id}} = await ctx.reply(getTimerMessage(seconds), {reply_to_message_id});
    const interval = setInterval(() => {
        if (seconds < 1) return clearInterval(interval);
        seconds -= 1;
        controller.abort();
        controller = new AbortController();
        ctx.editMessageText(getTimerMessage(seconds), {message_id}, controller.signal).catch(console.error);
    }, 1000);
    await wait(1000 * seconds);
    clearInterval(interval);
    await ctx.reply("Time is up !", {reply_to_message_id});
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
