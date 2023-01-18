import { fetch, ResponseType } from "@tauri-apps/api/http";

// const headers = new Headers();
// headers.append('Authorization', 'Basic YWRtaW46YWRtaW4=');

const snr = /(?:SNR Margin Down Stream\s<\/td>\s<td class='form_label_col'>\s)(\d+(?:\.\d+))/gm;
const downStream = /(?:Down Stream\s<\/td>\s<td class='form_label_col'>\s)(\d+)(?: kbps)/gm;

export default async function fetchConnection() {
   const response = await fetch<string>('http://192.168.1.1/adslconfig.htm', {
      method: 'GET',
      headers: { Authorization: 'Basic YWRtaW46YWRtaW4=' },
      responseType: ResponseType.Text
   });
   const text = response.data;
   const downStreamValue = downStream.exec(text);
   downStream.exec(text);
   const snrValue = snr.exec(text);
   snr.exec(text);
   return {
      downStream: downStreamValue ? Math.round(+downStreamValue[1] / 1024) : 0,
      snr: snrValue ? +snrValue[1] : 0,
   };
}
