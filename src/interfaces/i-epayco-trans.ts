/**
 * Datos recibidos de epayco
 *
 * @export
 * @interface IEpaycoTransRes
 */
export interface IEpaycoTransRes {
  x_cust_id_cliente: string; // Id del negocio
  x_ref_payco: string;
  x_id_factura: string;
  x_id_invoice: string;
  x_description: string;
  x_amount: string; // total de la venta
  x_amount_country: string; // Total de la venta en moneda local
  x_amount_ok: string;
  x_tax: string;
  x_amount_base: string;
  x_currency_code: string; // USD
  x_bank_name: string;
  x_cardnumber: string;
  x_quotas: string;
  x_respuesta: string; // 'Aceptada'
  x_response: string; //'Aceptada',
  x_approval_code: string;
  x_transaction_id: string;
  x_fecha_transaccion: string;
  x_transaction_date: string;
  x_cod_respuesta: string; //'1',
  x_cod_response: string; // '1',
  x_response_reason_text: string;
  x_errorcode: string;
  x_cod_transaction_state: string;
  x_transaction_state: string; //'Aceptada',
  x_franchise: string;
  x_business: string; // Nombre del negocio
  x_customer_doctype: string; //'CC',
  x_customer_document: string; // Numero de documento
  x_customer_name: string; // Nombre del comprador
  x_customer_lastname: string; // Apellido del comprador
  x_customer_email: string; // Correo del comprador
  x_customer_phone: string;
  x_customer_movil: string;
  x_customer_ind_pais: string;
  x_customer_country: string;
  x_customer_city: string;
  x_customer_address: string;
  x_customer_ip: string;
  x_test_request: string;
  x_signature: string;
  x_transaction_cycle: string;
  is_processable: string;
  x_extra1: string; // Token
  x_extra2: string; // Fecha
  x_extra3: string; // Carrito
}

/**
 * Datos a guardar de la transacción
 *
 * @export
 * @interface IEpaycoTransSend
 */
export interface IEpaycoTransSend {
  status: EnumIEpaycoTransStatus; // Estatus del proceso de la transaccion en el negocio
  x_cust_id_cliente: string; // Id del negocio
  x_ref_payco: string;
  x_id_invoice: string;
  x_description: string;
  x_amount: string; // total de la venta
  x_amount_country: string; // Total de la venta en moneda local
  x_tax: string;
  x_amount_base: string;
  x_currency_code: string; // USD
  x_bank_name: string;
  x_cardnumber: string;
  x_quotas: string;
  x_response: string; //'Aceptada',
  x_approval_code: string;
  x_transaction_id: string;
  x_transaction_date: string;
  x_cod_response: string; // '1',
  x_response_reason_text: string;
  x_errorcode: string;
  x_cod_transaction_state: string;
  x_transaction_state: string; //'Aceptada',
  x_franchise: string;
  x_customer_doctype: string; //'CC',
  x_customer_document: string; // Numero de documento
  x_customer_name: string; // Nombre del comprador
  x_customer_lastname: string; // Apellido del comprador
  x_customer_email: string; // Correo del comprador
  x_customer_phone: string;
  x_customer_movil: string;
  x_customer_ind_pais: string;
  x_customer_country: string;
  x_customer_city: string;
  x_customer_address: string;
  x_customer_ip: string;
  x_test_request: string;
  x_signature: string;
  x_transaction_cycle: string;
  is_processable: string;
  // Enviados del front
  token: string; // Token
  fecha: string; // Fecha
  userId: string;
  cart: string; //Carrito de compras en la transaccion
}

export enum EnumIEpaycoTransStatus {
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}
