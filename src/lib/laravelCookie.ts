import { createDecipheriv, createHmac } from "crypto";

interface LaravelEncryptedPayload {
  iv: string;
  value: string;
  mac: string;
  tag: string;
}

/**
 * Decrypt Laravel encrypted cookie and return the role
 * @param encryptedCookie - The encrypted cookie value from Laravel
 * @param appKey - Laravel APP_KEY from .env
 * @returns Role (string) or null if decryption fails
 */
export function decryptLaravelCookie(
  encryptedCookie: string,
  appKey: string
): string | null {
  try {
    // Decode URL-encoded cookie
    const decoded: string = decodeURIComponent(encryptedCookie);

    // Parse base64 JSON payload
    const payload: LaravelEncryptedPayload = JSON.parse(
      Buffer.from(decoded, "base64").toString()
    );

    // Extract encryption components
    const iv: Buffer = Buffer.from(payload.iv, "base64");
    const value: string = payload.value;
    const mac: string = payload.mac;

    // Process Laravel APP_KEY (remove base64: prefix)
    const key: Buffer = Buffer.from(appKey.replace("base64:", ""), "base64");

    // Verify MAC for integrity
    const hash: string = createHmac("sha256", key)
      .update(`${payload.iv}${value}`)
      .digest("hex");

    if (hash !== mac) {
      console.error("MAC verification failed - cookie may be tampered");
      return null;
    }

    // Decrypt using AES-256-CBC
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    let decrypted: string = decipher.update(value, "base64", "utf8");
    decrypted += decipher.final("utf8");

    // After decryption, the result is expected to be in the form of "userId|role"
    const role = decrypted.split("|")[1]; // Extract role (assumes role is after the "|")

    return role; // Return only the role
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Decryption error:", error.message);
    } else {
      console.error("Decryption error:", error);
    }
    return null;
  }
}
