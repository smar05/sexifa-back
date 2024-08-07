import { Context, Telegraf } from "telegraf";
import {
  ChatFromGetChat,
  ChatMemberAdministrator,
  ChatMemberOwner,
  User,
} from "telegraf/typings/core/types/typegram";
import telegramServices from "./telegram_services";
import backLogsServices from "./back-logs-service";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

/**
 * Comandos con el bot de telegram
 *
 * @export
 * @param {Telegraf} bot
 */
export function setupCommands(bot: Telegraf): void {
  Helpers.consoleLog("~ setupCommands: Inicia", EnumConsoleLogColors.INFO);

  /**
   * Obtener el id de un chat
   *
   * @param {Context} ctx
   * @return {*}
   */
  function miId(ctx: Context): void {
    Helpers.consoleLog("~ miId: Inicia", EnumConsoleLogColors.INFO);
    const userId: number = ctx.from?.id || NaN;

    Helpers.consoleLog(
      "~ miId ~ userId: Solicitud del id " + userId,
      EnumConsoleLogColors.INFO
    );

    if (!userId) {
      Helpers.consoleLog(
        "~ miId ~ userId: No se ha obtenido el id",
        EnumConsoleLogColors.ERROR
      );

      ctx.reply(`Ha ocurrido un error`);
      return;
    }

    ctx.reply(`Tu ID de usuario de Telegram es: ${userId}`);
  }

  /**
   * Manejar el evento cuando el bot sea añadido a un grupo
   *
   * @param {*} ctx
   * @return {*}  {Promise<void>}
   */
  async function newChatMemberBot(ctx: any): Promise<void> {
    Helpers.consoleLog("~ newChatMembers ~ Inicia", EnumConsoleLogColors.INFO);

    const newMembers: User[] = ctx.message?.new_chat_members;
    const groupId: number = ctx.chat?.id;
    let botId: number = NaN;

    try {
      botId = (await bot.telegram.getMe()).id;
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `telegram-bot-commands.service ~ newChatMembers ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );
    }

    // Verificar si el bot es el nuevo miembro añadido
    const botAdded: boolean = newMembers.some(
      (member: User) => member.id === botId && member.is_bot
    );

    if (!botAdded) {
      Helpers.consoleLog(
        "~ newChatMembers ~ botAdded: No se ha añadido el bot al grupo",
        EnumConsoleLogColors.ERROR
      );
      return;
    }

    if (!groupId) {
      Helpers.consoleLog(
        "~ newChatMembers ~ groupId: No se ha obtenido el id del grupo",
        EnumConsoleLogColors.ERROR
      );
      ctx.reply(`Ha ocurrido un error obteniendo el id del grupo`);
      return;
    }
    Helpers.consoleLog(
      `~ newChatMembers ~ groupId: ${groupId}`,
      EnumConsoleLogColors.INFO
    );

    // Datos del grupo
    let groupData: ChatFromGetChat = null as any;

    try {
      groupData = await bot.telegram.getChat(groupId);
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `telegram-bot-commands.service ~ newChatMembers ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );
    }

    // Buscar un creador o administrador del grupo
    let admins: (ChatMemberOwner | ChatMemberAdministrator)[] = null as any;

    try {
      admins = await bot.telegram.getChatAdministrators(groupId);
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `telegram-bot-commands.service ~ newChatMembers ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );
    }

    let adminUser: ChatMemberOwner | ChatMemberAdministrator =
      admins.find(
        (admin: ChatMemberOwner | ChatMemberAdministrator) =>
          !admin.user.is_bot && admin.status === "creator"
      ) ||
      admins.find(
        (admin: ChatMemberOwner | ChatMemberAdministrator) =>
          !admin.user.is_bot &&
          !admin.is_anonymous &&
          admin.status === "administrator"
      ) ||
      (null as any);

    if (!adminUser) {
      Helpers.consoleLog(
        "~ newChatMembers ~ adminUser: No se ha encontrado un administrador del grupo",
        EnumConsoleLogColors.ERROR
      );
      ctx.reply(`Ha ocurrido un error encontrando al administrador del grupo`);
      return;
    }

    if (
      !(
        groupData.type === "supergroup" ||
        groupData.type === "private" ||
        groupData.type === "channel" ||
        groupData.type === "group"
      )
    ) {
      Helpers.consoleLog(
        `~ newChatMembers ~ ${(groupData as any).type}: No es un grupo`,
        EnumConsoleLogColors.ERROR
      );

      await telegramServices.enviarMensajeBotAUsuario(
        adminUser.user.id,
        `Ha ocurrido un error con el grupo.`
      );
      return;
    }

    // Enviar el id del grupo al dueño del grupo
    await telegramServices.enviarMensajeBotAUsuario(
      adminUser.user.id,
      `Conexion exitosa con el grupo: '${
        (groupData as any).title
      }'.\n\nEl Id de tu grupo es: ${groupId}.\n\nNo olvides añadirme como administrador del grupo y darme permisos para añadir usuarios.`
    );

    return;
  }

  // Comando /my_id
  bot.command("my_id", (ctx: Context) => {
    miId(ctx);
  });

  // Manejar el evento cuando el bot sea añadido a un grupo
  bot.on("new_chat_members", async (ctx: any) => {
    newChatMemberBot(ctx);
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
