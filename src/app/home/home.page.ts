import { Component } from '@angular/core';

interface Pixel {
  r: number,
  g: number,
  b: number
}

interface packet{
  method: string
}

interface ConnectionPacket extends packet{
  username:string
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  socket: WebSocket;

  constructor() {
  }

  connect(): void {
    console.log("connecting");

    let url: string = (<HTMLInputElement>document.getElementById("ip-input").firstChild).value;
    let username: string = (<HTMLInputElement>document.getElementById("username-input").firstChild).value;

    this.socket = new WebSocket(url);

    this.socket.onopen = function (e) {

      let data: ConnectionPacket = { method:"connect", username: username }

      this.send(JSON.stringify(data));
    };

    this.socket.onmessage = (ev: MessageEvent) => {
      console.log(ev.data);
    };

    this.socket.onerror = (ev) => {
      console.error(ev);
    }
  }

  packetSendTest() {
    this.socket.send("test");
  }
}
