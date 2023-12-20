import { Telegraf } from "telegraf";
import { environment } from "../environment";

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
      console.error(error);
      return error;
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
      console.error(error);
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
      console.error(error);
    }
  }
}

const telegramServices = new TelegramServices();

export default telegramServices;
