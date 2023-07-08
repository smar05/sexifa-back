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

  /**
   * Mensaje de prueba entre el cliente y el bot
   *
   * @param {Request} req
   * @param {Response} res
   * @memberof TelegramController
   */
  public async comunicarBotCliente(req: Request, res: Response): Promise<void> {
    const userId: any = req.query.fromId;

    let res2: any = await telegramServices.enviarMensajeBotAUsuario(
      userId,
      "¡Hola! Soy el bot de OnlyGram"
    );

    if (res2.response && !res2.response.ok) {
      res
        .json({
          mensaje: "Conexion erronea",
          code: 400,
        })
        .status(res2.response.error_code);

      return;
    }

    res.json({
      mensaje: "Conexion exitosa",
      code: 200,
    });

    return;
  }
}

const telegramController = new TelegramController();

export default telegramController;
