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
      window.location.href = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/home"
    }

    let usersRequest:packet = {
      method: "getPlayers"
    }

    let selfRequest:packet = {
      method: "getSelf"
    }

    this.socket.send(JSON.stringify(usersRequest));
    this.socket.send(JSON.stringify(selfRequest));

    this.socket.onmessage = (ev: MessageEvent) => {
      let message:any;
      
      try {
        message = JSON.parse(ev.data);
        console.log(message.method);
      }
      catch(e){
        console.log(`could not parse ${ev.data}`)
        console.error(e);
        return;
      }

      switch(message["method"]){
        case "updateUsers":
          this.makeUserProfiles(message["data"]);
          break;
        
        case "sendSelf":

          console.log("recieved self")

          if (message.data.isPartyLeader){
            this.showLeaderControls();
          }

          break;

        case "startGame":
          this.router.navigate(['/prompt']);
          
          break;

        default:
          console.log(`unknown packet: ${message}`)
          break;
      }
    };
  }

  makeUserProfiles(data:any){
    document.getElementById("users").innerHTML = "";

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

    cardHead.innerHTML = "<h2 style='margin-left:5%;'>" + user.username + "</h2>";
    
    card.appendChild(cardHead);
    card.appendChild(cardBody);

    document.getElementById("users").appendChild(card);
  }

  showLeaderControls():void{
    document.getElementById("leader-controls").setAttribute("style", "");
    document.getElementById("play-button").setAttribute("style", "");
  }

  startGame(){
    let data = {
      method: "startGame",
      data: {
        gameType: "default"
      }
    }

    this.socket.send(JSON.stringify(data));
  }
}
