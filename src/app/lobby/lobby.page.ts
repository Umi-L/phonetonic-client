import { Component, OnInit } from '@angular/core';
import { DataPassService } from '../data-pass.service';
import { Router } from '@angular/router';


interface packet{
  method: string
}

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {

  socket:WebSocket;

  constructor(private DataPassService:DataPassService, private router:Router) { }

  ngOnInit() {
    this.socket = this.DataPassService.getData();

    if (!this.socket){
      this.router.navigate(['/home']);
      return;
    }

    let usersRequest:packet = {
      method: "getPlayers"
    }

    this.socket.send(JSON.stringify(usersRequest));

    this.socket.onmessage = (ev: MessageEvent) => {
      let message:any;
      
      try {
        message = JSON.parse(ev.data);
      }
      catch(e){
        console.error(e);
        return;
      }

      switch(message["method"]){
        case "updateUsers":
          this.makeUserProfiles(message["data"]);

        default:
          console.log("unknown message recived");
      }
    };
  }

  makeUserProfiles(data:any){
    let keys = Object.keys(data);

    keys.forEach((key:string) =>{
      let user = data[key];
      this.makeUserCard(user);
    })
  }

  makeUserCard(user:any){
    let card = document.createElement("ion-card");

    let cardHead = document.createElement("ion-card-title");
    let cardBody = document.createElement("ion-card-content");

    cardHead.innerHTML = user.username;
    
    card.appendChild(cardHead);
    card.appendChild(cardBody);

    document.getElementById("users").appendChild(card);
    console.log("card created");
  }
}
