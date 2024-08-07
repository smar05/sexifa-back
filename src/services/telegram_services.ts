import { Telegraf } from "telegraf";
import { environment } from "../environment";
import backLogsServices from "./back-logs-service";
import {
  ChatMember,
  ChatMemberAdministrator,
  ChatMemberOwner,
  UserFromGetMe,
} from "telegraf/typings/core/types/typegram";
import { Helpers } from "../helpers/helpers";
import { EnumConsoleLogColors } from "../enums/enum-console-log-colors";

class TelegramServices {
  constructor() {
    Helpers.consoleLog(
      "~ file: telegram_services.ts ~ TelegramServices ~ constructor: Inicia",
      EnumConsoleLogColors.INFO
    );
  }

  /**
   * Enviar un mensaje del bot a un usuario
   *
   * @param {(string | number)} userId
   * @param {string} mensaje
   * @return {*}  {void}
   * @memberof TelegramServices
   */
  public async enviarMensajeBotAUsuario(
    userId: string | number,
    mensaje: string
  ): Promise<any> {
    Helpers.consoleLog(
      "~ file: telegram_services.ts ~ TelegramServices ~ enviarMensajeBotAUsuario: Inicia para el userId: " +
        userId,
      EnumConsoleLogColors.INFO
    );
    const bot = new Telegraf(environment.tokenTelegraf);

    try {
      return await bot.telegram.sendMessage(userId, mensaje);
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramServices ~ enviarMensajeBotAUsuario ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );
    }
  }

  /**
   *
   *
   * @param {(string | number)} chatId
   * @param {number} userId
   * @return {*}  {void}
   * @memberof TelegramServices
   */
  public async unbanChatMember(
    chatId: string | number,
    userId: number
  ): Promise<void> {
    Helpers.consoleLog(
      "~ file: telegram_services.ts ~ TelegramServices ~ unbanChatMember: Inicia para el chatId: " +
        chatId,
      EnumConsoleLogColors.INFO
    );
    const bot = new Telegraf(environment.tokenTelegraf);

    try {
      await bot.telegram.unbanChatMember(chatId, userId);
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramServices ~ unbanChatMember ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );
    }
  }

  /**
   * Generar un link para acceder a un grupo
   *
   * @param {string} chatId
   * @param {number} expireDate
   * @param {number} memberLimit
   * @return {*}  {Promise<string>}
   * @memberof TelegramServices
   */
  public async createChatInviteLink(
    chatId: string,
    expireDate: number,
    memberLimit: number
  ): Promise<string> {
    Helpers.consoleLog(
      "~ file: telegram_services.ts ~ TelegramServices ~ createChatInviteLink: Inicia para el chatId: " +
        chatId,
      EnumConsoleLogColors.INFO
    );
    const bot = new Telegraf(environment.tokenTelegraf);

    const resLink = await bot.telegram.createChatInviteLink(chatId, {
      member_limit: memberLimit,
      expire_date: expireDate,
    });

    return resLink.invite_link;
  }

  /**
   *
   *
   * @param {(string | number)} chatId
   * @param {number} userId
   * @param {number} tiempoBaneado
   * @memberof TelegramServices
   */
  public banChatMember(
    chatId: string | number,
    userId: number,
    tiempoBaneado: number
  ): void {
    Helpers.consoleLog(
      "~ file: telegram_services.ts ~ TelegramServices ~ banChatMember: Inicia para el chatId: " +
        chatId,
      EnumConsoleLogColors.INFO
    );

    const bot = new Telegraf(environment.tokenTelegraf);

    try {
      // Revocar el acceso del usuario al grupo
      bot.telegram.banChatMember(chatId, userId, tiempoBaneado, {
        revoke_messages: false,
      });
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramServices ~ banChatMember ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );
    }
  }

  /**
   * Consulta si un usuario pertenece a un grupo
   *
   * @param {(string | number)} chatId
   * @param {number} userId
   * @return {*}  {Promise<boolean>}
   * @memberof TelegramServices
   */
  public async esMiembroDelGrupo(
    chatId: string | number,
    userId: number
  ): Promise<boolean> {
    Helpers.consoleLog(
      "~ file: telegram_services.ts ~ TelegramServices ~ esMiembroDelGrupo: Inicia para el chatId: " +
        chatId,
      EnumConsoleLogColors.INFO
    );

    const bot: Telegraf = new Telegraf(environment.tokenTelegraf);

    try {
      let member: ChatMember = await bot.telegram.getChatMember(chatId, userId);
      Helpers.consoleLog(
        "~ TelegramServices ~ member:",
        EnumConsoleLogColors.INFO,
        [member]
      );

      return (
        member &&
        (member.status === "member" || member.status === "administrator")
      );
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramServices ~ esMiembroDelGrupo ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      return false;
    }
  }

  /**
   * Consulta si el bot pertenece a un grupo y es admin
   *
   * @param {(string | number)} chatId
   * @return {*}  {Promise<boolean>}
   * @memberof TelegramServices
   */
  public async botEsAdminDelGrupo(chatId: string | number): Promise<boolean> {
    Helpers.consoleLog(
      "~ file: telegram_services.ts ~ TelegramServices ~ botEsAdminDelGrupo: Inicia para el chatId: " +
        chatId,
      EnumConsoleLogColors.INFO
    );

    const bot: Telegraf = new Telegraf(environment.tokenTelegraf);

    try {
      const botInfo: UserFromGetMe = await bot.telegram.getMe();
      let admins: (ChatMemberOwner | ChatMemberAdministrator)[] =
        await bot.telegram.getChatAdministrators(chatId);

      if (!admins) return false;

      let botMember: ChatMemberAdministrator = admins.find(
        (admin: ChatMemberOwner | ChatMemberAdministrator) =>
          admin.user.is_bot &&
          admin.user.id === botInfo.id &&
          admin.status === "administrator"
      ) as ChatMemberAdministrator;

      if (!botMember) return false;

      // Validar que tenga permisos de añadir usuarios
      if (!(botMember.can_restrict_members && botMember.can_invite_users))
        return false;

      return true;
    } catch (error) {
      backLogsServices.catchProcessError(
        `Error: ${error}`,
        `TelegramServices ~ botEsAdminDelGrupo ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`
      );

      return false;
    }
  }
}

const telegramServices = new TelegramServices();

export default telegramServices;
