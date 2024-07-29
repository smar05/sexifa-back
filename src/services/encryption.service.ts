import { environment } from "../environment";
import forge from "node-forge";

class EncryptionService {
  private privateKey: forge.pki.rsa.PrivateKey = null as any;

  constructor() {
    console.log("🚀 ~ EncryptionService ~ constructor: Inicia");
    this.privateKey = forge.pki.privateKeyFromPem(environment.private_key);
  }

  /**
   * Desencriptar los datos
   *
   * @param {string} data
   * @return {*}  {string}
   * @memberof EncryptionService
   */
  public decryptData(data: string): string {
    console.log("🚀 ~ EncryptionService ~ decryptData ~ data:", data);
    console.log("🚀 ~ EncryptionService ~ decryptData: Inicia");
    const encryptedData: forge.Bytes = forge.util.decode64(data);
    const decryptedData: forge.Bytes = this.privateKey.decrypt(
      encryptedData,
      "RSA-OAEP",
      {
        md: forge.md.sha256.create(),
        mgf1: forge.mgf.mgf1.create(forge.md.sha1.create()),
      }
    );
    return decryptedData;
  }

  public decryptDataJson(data: { [key: string]: string }): {
    [key: string]: string;
  } {
    console.log("🚀 ~ EncryptionService ~ decryptDataJson: Inicia");

    for (const key of Object.keys(data)) {
      if (data[key] == "undefined" || data[key] == "null" || data[key] == "") {
        data[key] = "null" as any;
        continue;
      }

      let subData: string[] | string = null as any;

      try {
        subData = JSON.parse(data[key]);
      } catch (error) {
        subData = data[key];
      }

      if (typeof subData === "object" && (subData as any).length > 0) {
        let allData = [];

        for (let d of subData) {
          allData.push(this.decryptData(d));
        }

        data[key] = JSON.stringify(allData);

        continue;
      }

      data[key] = this.decryptData(data[key]);
    }

    return data;
  }
}

const encryptionService = new EncryptionService();

export default encryptionService;
