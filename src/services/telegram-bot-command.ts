import { Context, Telegraf } from "telegraf";
import { environment } from "../environment";

export function setupCommands() {
  const bot = new Telegraf(environment.tokenTelegraf);

  /**
   * Obtener el id de un chat
   *
   * @param {Context} ctx
   * @return {*}
   */
  function miId(ctx: Context): void {
    const userId: number = ctx.from?.id || NaN;

    if (!userId) {
      ctx.reply(`Ha ocurrido un error`);
      return;
    }

    ctx.reply(`Tu ID de usuario de Telegram es: ${userId}`);
  }

  // Comando /mi_id
  bot.command("mi_id", (ctx: Context) => {
    miId(ctx);
  });

  // Comando start
  bot.start((ctx: any) => {
    const startPayload: any = ctx.startPayload;
    if (startPayload === "mi_id") {
      miId(ctx);
    } else {
      ctx.reply("Bienvenido! Usa /mi_id para obtener tu ID de usuario.");
    }
  });

  // Iniciar el bot
  bot.launch();
}
