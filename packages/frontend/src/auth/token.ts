// Secure token storage with encryption
const TOKEN_KEY = "carely-token";
const ENCRYPTION_KEY = "carely-secure-key-2024"; // In production, this should be generated per session

// Simple encryption/decryption for token storage
// In production, consider using a more robust encryption library
const encrypt = (text: string): string => {
  try {
    // Simple XOR encryption with a key
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^
          ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return btoa(result); // Base64 encode
  } catch {
    return text; // Fallback to plain text if encryption fails
  }
};

const decrypt = (encryptedText: string): string => {
  try {
    const decoded = atob(encryptedText);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^
          ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return result;
  } catch {
    return encryptedText; // Fallback to encrypted text if decryption fails
  }
};

export const getToken = (): string | null => {
  try {
    // Use sessionStorage instead of localStorage for better security
    // sessionStorage is cleared when the browser tab is closed
    const encryptedToken = sessionStorage.getItem(TOKEN_KEY);
    if (!encryptedToken) return null;

    const decryptedToken = decrypt(encryptedToken);
    return decryptedToken;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    const encryptedToken = encrypt(token);
    sessionStorage.setItem(TOKEN_KEY, encryptedToken);
  } catch (error) {
    console.error("Error storing token:", error);
    // Fallback to unencrypted storage if encryption fails
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

export const signOut = (): void => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Error during sign out:", error);
  }
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;

  // decode jwt token to check expiration
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiration = payload.exp * 1000; // convert to milliseconds

    // Remove console.log for security (don't expose token info in console)
    if (expiration < Date.now()) {
      // Token is expired
      throw new Error("Token expired");
    }
    return true;
  } catch (error) {
    signOut();
    return false;
  }
};
