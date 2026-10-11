const MARK = "/upload/f_auto,q_auto,w_1920,c_limit/";

export function fillCrop(url, width, height) {
  if (!url || !url.includes(MARK)) return url;
  return url.replace(MARK, `/upload/f_auto,q_auto,w_${width},h_${height},c_fill,g_face/`);
}