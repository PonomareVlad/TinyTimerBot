import info from "../info.json" assert {type: "json"};

export const botInfo = info || undefined;

export const {
    TIMER_LIMIT,
    WEBHOOK_PREFIX: prefix,
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(":").pop()
} = process.env;

export const timerLimit = TIMER_LIMIT ? parseInt(TIMER_LIMIT) : Infinity;
