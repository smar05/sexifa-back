import { Request, Response } from "express";
import telegramServices from "../services/telegram_services";

class TelegramController {
  constructor() {}

  /**
   * Enviar link de acceso
   *
   * @param {Request} req
   * @param {Response} res
   * @return {*}  {Promise<void>}
   * @memberof TelegramController
   */
  public async enviarLink(req: Request, res: Response): Promise<void> {
    const chatId = req.body.chatId;
    const userId = req.body.fromId;

    // Habilitar al usuario al chat
    telegramServices.unbanChatMember(chatId, userId);

    // Calcular el tiempo de expiración en una hora del link
    const expireDate = Math.floor(Date.now() / 1000) + 60; //3600;

    // Crear el link
    let inviteLink: string = await telegramServices.createChatInviteLink(
      chatId,
      expireDate,
      1
    );

    // El bot envia el link al usuario
    telegramServices.enviarMensajeBotAUsuario(
      userId,
      `Link generado: \n ${inviteLink}`
    );

    res.json({
      mensaje: "Link generado",
    });
  }

  /**
   * Quitar acceso de un usuario a un grupo
   *
   * @param {Request} req
   * @param {Response} res
   * @memberof TelegramController
   */
  public quitarAcceso(req: Request, res: Response): void {
    const chatId = req.body.chatId;
    const userId = req.body.fromId;

    telegramServices.banChatMember(chatId, userId, 366);

    res.json({
      mensaje: "Usuario eliminado",
    });
  }
}

const telegramController = new TelegramController();

export default telegramController;
