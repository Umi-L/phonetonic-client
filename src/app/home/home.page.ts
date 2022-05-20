import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataPassService } from '../data-pass.service';

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
  
  constructor(private router: Router, private DataPassService: DataPassService){}

  connect(): void {
    console.log("connecting");

    let url: string = (<HTMLInputElement>document.getElementById("ip-input").firstChild).value;
    let username: string = (<HTMLInputElement>document.getElementById("username-input").firstChild).value;

    this.socket = new WebSocket(url);

    this.socket.onopen = (e) => {

      let data: ConnectionPacket = { method:"connect", username: username }

      this.socket.send(JSON.stringify(data));

      this.DataPassService.setData(this.socket);

      this.router.navigate(['/lobby']);
    };

    this.socket.onmessage = (ev: MessageEvent) => {
      console.log(ev.data);
    };

    this.socket.onerror = (ev) => {
      console.error(ev);
    }
  }
}
