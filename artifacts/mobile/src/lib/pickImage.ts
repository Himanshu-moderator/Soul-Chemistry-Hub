import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

// Opens the photo library and returns an image ready to store with the profile, or
// null if nothing was picked. On the web the picture is shrunk to a small JPEG data
// string, because a temporary browser link would stop working after a reload and a
// full-size photo would not fit in the browser's storage.
export async function pickPhoto(aspect: [number, number] = [3, 4]): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect, quality: 0.6 });
  const asset = result.canceled ? null : result.assets?.[0];
  if (!asset) return null;
  return Platform.OS === "web" ? shrink(asset.uri, 900) : asset.uri;
}

function shrink(uri: string, maxSide: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => resolve(uri);
    img.src = uri;
  });
}
