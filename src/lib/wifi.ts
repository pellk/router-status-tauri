import { fetch, ResponseType } from "@tauri-apps/api/http";

const table = `<table class=formlisting border=0>`;
const endTable = `</table>`;
const row = `<tr bgcolor=#b7b7b7>`;
const col = `<td><font size=2>`;
const endCol = `</td>`;

export default async function fetchWifi() {
   const response = await fetch<string>('http://192.168.1.1/wlclients.htm',   {
      method: 'GET',
      headers: { Authorization: 'Basic YWRtaW46YWRtaW4=' },
      responseType: ResponseType.Text
   });
   let text = response.data;
   text = text.slice(text.indexOf(table));
   text = text.slice(undefined, text.indexOf(endTable));

   const data: Record<string, number> = {};

   for (; ;) {
      const rowIndex = text.indexOf(row);
      if (rowIndex < 0) break;
      text = text.slice(rowIndex + row.length);

      text = text.slice(text.indexOf(col) + col.length);
      const mac = text.slice(undefined, text.indexOf(endCol));

      text = text.slice(text.indexOf(col) + col.length);
      const packets = +text.slice(undefined, text.indexOf(endCol));

      data[mac] = packets;
   }
   return data;
}



