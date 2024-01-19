import { Telegraf } from "telegraf";
import { environment } from "../environment";
import { IBackLogs } from "../interfaces/i-back-logs";
import backLogsServices from "./back-logs-service";
import { variablesGlobales } from "../variables-globales";
import { ChatMember } from "telegraf/typings/core/types/typegram";

class TelegramServices {
  constructor() {
    console.log(
      "🚀 ~ file: telegram_services.ts ~ TelegramServices ~ constructor: Inicia"
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
    console.log(
      "🚀 ~ file: telegram_services.ts ~ TelegramServices ~ enviarMensajeBotAUsuario: Inicia para el userId: " +
        userId
    );
    const bot = new Telegraf(environment.tokenTelegraf);

    try {
      return await bot.telegram.sendMessage(userId, mensaje);
    } catch (error) {
      let data: IBackLogs = {
        userId: variablesGlobales.userId,
        date: variablesGlobales.date,
        log: `TelegramServices ~ enviarMensajeBotAUsuario ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`,
      };

      backLogsServices
        .postDataFS(data)
        .then((res) => {})
        .catch((err) => {
          console.log("🚀 ~ Server ~ err:", err);
          throw err;
        });

      console.error(error);
      throw error;
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
  public unbanChatMember(chatId: string | number, userId: number): void {
    console.log(
      "🚀 ~ file: telegram_services.ts ~ TelegramServices ~ unbanChatMember: Inicia para el chatId: " +
        chatId
    );
    const bot = new Telegraf(environment.tokenTelegraf);

    try {
      bot.telegram.unbanChatMember(chatId, userId);
    } catch (error) {
      let data: IBackLogs = {
        userId: variablesGlobales.userId,
        date: variablesGlobales.date,
        log: `TelegramServices ~ unbanChatMember ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`,
      };

      backLogsServices
        .postDataFS(data)
        .then((res) => {})
        .catch((err) => {
          console.log("🚀 ~ Server ~ err:", err);
          throw err;
        });

      console.error(error);
      throw error;
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
    console.log(
      "🚀 ~ file: telegram_services.ts ~ TelegramServices ~ createChatInviteLink: Inicia para el chatId: " +
        chatId
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
    console.log(
      "🚀 ~ file: telegram_services.ts ~ TelegramServices ~ banChatMember: Inicia para el chatId: " +
        chatId
    );

    const bot = new Telegraf(environment.tokenTelegraf);

    try {
      // Revocar el acceso del usuario al grupo
      bot.telegram.banChatMember(chatId, userId, tiempoBaneado, {
        revoke_messages: false,
      });
    } catch (error) {
      let data: IBackLogs = {
        userId: variablesGlobales.userId,
        date: variablesGlobales.date,
        log: `TelegramServices ~ banChatMember ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`,
      };

      backLogsServices
        .postDataFS(data)
        .then((res) => {})
        .catch((err) => {
          console.log("🚀 ~ Server ~ err:", err);
          throw err;
        });

      console.error(error);
      throw error;
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
    console.log(
      "🚀 ~ file: telegram_services.ts ~ TelegramServices ~ esMiembroDelGrupo: Inicia para el chatId: " +
        chatId
    );

    const bot: Telegraf = new Telegraf(environment.tokenTelegraf);

    try {
      let member: ChatMember = await bot.telegram.getChatMember(chatId, userId);
      console.log("🚀 ~ TelegramServices ~ member:", member);

      return (
        member &&
        (member.status === "member" || member.status === "administrator")
      );
    } catch (error) {
      let data: IBackLogs = {
        userId: variablesGlobales.userId,
        date: variablesGlobales.date,
        log: `TelegramServices ~ esMiembroDelGrupo ~ JSON.stringify(error): ${JSON.stringify(
          error
        )}`,
      };

      backLogsServices
        .postDataFS(data)
        .then((res) => {})
        .catch((err) => {
          console.log("🚀 ~ Server ~ err:", err);
          throw err;
        });

      console.error(error);

      return false;
    }
  }
}

const telegramServices = new TelegramServices();

export default telegramServices;
