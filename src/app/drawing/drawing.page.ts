import { Component, OnInit } from '@angular/core';
import { DataPassService } from '../data-pass.service';

interface point {
  x: number;
  y: number;
}

interface action{
  tool: string;
  path: Array<point>;
  color: string;
}

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.page.html',
  styleUrls: ['./drawing.page.scss'],
})

export class DrawingPage implements OnInit {
  constructor( private DataPassService: DataPassService) {}

  canvas:HTMLCanvasElement;
  ctx:CanvasRenderingContext2D;

  actions:Array<action>;

  draw:boolean;

  mouseX:number;
  mouseY:number;

  socket:WebSocket;


  ngOnInit() {

    this.socket = this.DataPassService.getData();

    if (!this.socket){
      window.location.href = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/home"
    }

    this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this.canvas.height = 700;
    this.canvas.width = 1000;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 5;

    let prevX = null;
    let prevY = null;

    this.draw = false;

    this.actions = [];
    
    let penStroke:Array<point> = [];

    let tool:string = "pen";

    document.getElementById("picker").onchange = this.changeColor;

    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button != 0)
        return;
      if (tool == "pen" && this.mouseOnCanvas()){
        this.draw = true;
      }
    });
    this.canvas.addEventListener('mouseup', (e) => {
      if (tool == "pen"){

        this.draw = false;

        if (penStroke.length < 1)
          return;

        this.actions.push({tool: "pen", path: penStroke, color:this.ctx.strokeStyle} as action);
        penStroke = [];
      }
    });

    window.addEventListener('mousemove', (e) => {

      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (tool == "pen"){

        let rect = this.canvas.getBoundingClientRect();

        if (prevX == null || prevY == null || !this.draw) {
          prevX = e.clientX - rect.x;
          prevY = e.clientY - rect.y;
          return;
        }

        let mouseX = e.clientX - rect.x;
        let mouseY = e.clientY - rect.y;

        this.ctx.beginPath();
        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(mouseX, mouseY);
        this.ctx.stroke();

        penStroke.push({x:prevX, y:prevY} as point);
        penStroke.push({x:mouseX, y:mouseY} as point);

        prevX = mouseX;
        prevY = mouseY;
      }
    });
  }

  changeColor = () => {
    let value = (<HTMLInputElement>document.getElementById("picker")).value;
    this.ctx.strokeStyle = value;
  }

  undoAction(){
    this.draw = false;
    
    console.log(this.actions.pop());

    this.drawingFromActions();
  }

  drawingFromActions(){
    this.clearCanvas();
    
    this.actions.forEach((act:action) =>{
      if (act.tool == "pen"){
        this.ctx.strokeStyle = act.color;
        for (let i = 1; i < act.path.length; i++){
          this.ctx.beginPath();

          this.ctx.moveTo(act.path[i-1].x, act.path[i-1].y);
          this.ctx.lineTo(act.path[i].x, act.path[i].y);

          this.ctx.stroke();
        }
      }
    })

    this.changeColor();
  }

  clearCanvas(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  }

  clearCanvasTool(){
    this.clearCanvas();

    this.actions.push({tool:"clear", path: [], color: "na"} as action)
  }

  mouseOnCanvas():boolean{
    let rect = this.canvas.getBoundingClientRect();

    if (this.mouseX > rect.x && this.mouseY > rect.y && this.mouseX < rect.x + rect.width && this.mouseY < rect.y + rect.height){
      return true;
    }
    return false;
  }
}
