import { Context, Telegraf } from "telegraf";

/**
 * Comandos con el bot de telegram
 *
 * @export
 * @param {Telegraf} bot
 */
export function setupCommands(bot: Telegraf): void {
  console.log("🚀 ~ setupCommands: Inicia");

  /**
   * Obtener el id de un chat
   *
   * @param {Context} ctx
   * @return {*}
   */
  function miId(ctx: Context): void {
    console.log("🚀 ~ miId: Inicia");
    const userId: number = ctx.from?.id || NaN;

    console.log("🚀 ~ miId ~ userId: Solicitud del id ", userId);

    if (!userId) {
      console.log("🚀 ~ miId ~ userId: No se ha obtenido el id");
      ctx.reply(`Ha ocurrido un error`);
      return;
    }

    ctx.reply(`Tu ID de usuario de Telegram es: ${userId}`);
  }

  // Comando /my_id
  bot.command("my_id", (ctx: Context) => {
    miId(ctx);
  });

  // Comando start
  bot.start((ctx: any) => {
    const startPayload: any = ctx.startPayload;
    if (startPayload === "my_id") {
      miId(ctx);
    } else {
      ctx.reply(
        "Bienvenido! Usa el comando /my_id para obtener tu ID de usuario en Telegram."
      );
    }
  });

  // Iniciar el bot
  //bot.launch();
}
