import { Telegraf } from "telegraf";

class TelegramServices {
  constructor() {}

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
    const bot = new Telegraf("6262605361:AAH8Y9p4YRuP0BYH4nd-2Dro3Vv0DJDlQbk");

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
    const bot = new Telegraf("6262605361:AAH8Y9p4YRuP0BYH4nd-2Dro3Vv0DJDlQbk");

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
    const bot = new Telegraf("6262605361:AAH8Y9p4YRuP0BYH4nd-2Dro3Vv0DJDlQbk");

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
    const bot = new Telegraf("6262605361:AAH8Y9p4YRuP0BYH4nd-2Dro3Vv0DJDlQbk");

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
