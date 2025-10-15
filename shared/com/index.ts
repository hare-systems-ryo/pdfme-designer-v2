
export const FileToDataUrl = (file: File) => {
  return new Promise<any>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        return resolve(String(reader.result));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      return reject(error);
    }
  });
};
export const FileToText = (file: File) => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(String(reader.result));
    };
    reader.readAsText(file);
  });
};

