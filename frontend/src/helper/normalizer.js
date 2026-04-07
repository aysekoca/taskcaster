export const normalizeGoError = (error) => {
  if (!error) return "An error occurred.";

  let errorObj = null;

  // 1. JSON handling (Keep existing logic)
  if (typeof error === "object") {
    errorObj = error;
  } else if (typeof error === "string" && error.trim().startsWith("{")) {
    try {
      errorObj = JSON.parse(error);
    } catch (e) {
      errorObj = null;
    }
  }

  // 2. Duplicated key handling
  if (errorObj && errorObj.message === "Duplicated key") {
    const field = errorObj.constraint || "Value";
    return `${field} is already in use.`;
  }

  // 3. Multi-line String handling
  const errorString = typeof error === "string" ? error : JSON.stringify(error);
  
  // Satırlara böl ve her bir validator hatasını işle
  const lines = errorString.split('\n');
  const results = lines.map(line => {
    // Regex her satır için ayrı çalışır
    const regex = /\[(.*?)\].*?\|\s*(.*)/;
    const match = line.match(regex);

    if (!match) return null;

    const field = match[1];
    const rawMessage = match[2].toLowerCase();

    let cleanMessage = "is invalid.";

    if (rawMessage.includes("required")) {
      cleanMessage = "is required.";
    } 
    else if (rawMessage.includes("min")) {
      const val = rawMessage.match(/=(\d+)/)?.[1];
      cleanMessage = val ? `must be at least ${val} characters.` : "is too short.";
    } 
    else if (rawMessage.includes("max")) {
      const val = rawMessage.match(/=(\d+)/)?.[1];
      cleanMessage = val ? `must be at most ${val} characters.` : "is too long.";
    } 
    else if (rawMessage.includes("email")) {
      cleanMessage = "must be a valid email address.";
    }
    else if (rawMessage.includes("gte")) {
       const val = rawMessage.match(/=(\d+)/)?.[1];
       cleanMessage = val ? `must be greater than or equal to ${val}.` : "is below the minimum value.";
    }

    return `${field} ${cleanMessage}`;
  }).filter(Boolean); // Geçersiz (null) eşleşmeleri temizle

  // Eğer işlenmiş hatalar varsa boşlukla birleştir, yoksa orijinal mesajı döndür
  if (results.length > 0) {
    return results.join(' ');
  }

  return errorObj?.message || errorString;
};