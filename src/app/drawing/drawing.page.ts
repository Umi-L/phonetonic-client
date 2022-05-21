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
  lineWidth: number;
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

  tool:string;


  ngOnInit() {

    // this.socket = this.DataPassService.getData();

    // if (!this.socket){
    //   window.location.href = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/home"
    // }

    this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this.canvas.height = 700;
    this.canvas.width = 1000;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 5;
    this.ctx.lineCap = 'round';

    let prevX = null;
    let prevY = null;

    this.draw = false;

    this.actions = [];
    
    let penStroke:Array<point> = [];

    this.tool = "pen";

    let startPoint:point;

    document.getElementById("picker").onchange = this.changeColor;

    this.canvas.addEventListener('mousedown', (e) => {
      let rect = this.canvas.getBoundingClientRect();
      let mouseX = this.mouseX - rect.x;
      let mouseY = this.mouseY - rect.y;

      if (e.button != 0)
        return;

      if (!this.mouseOnCanvas())
        return;

      if (this.tool == "pen"){
        this.draw = true;
      }
      else if (this.tool == "fill"){
        this.floodFill(this.ctx, mouseX, mouseY, this.hexToRgb(this.ctx.strokeStyle));

        this.actions.push({tool: "fill", path: [{x:mouseX, y:mouseY}], color:this.ctx.strokeStyle, lineWidth: this.ctx.lineWidth} as action);
      }
      else if (this.tool == "elipse" || this.tool == "line" || this.tool == "rectangle"){
        startPoint = {
          x: mouseX,
          y: mouseY
        }
      }
    });
    this.canvas.addEventListener('mouseup', (e) => {
      if (!this.mouseOnCanvas())
        return;

      if (this.tool == "pen"){

        this.draw = false;

        if (penStroke.length < 1)
          return;

        this.actions.push({tool: "pen", path: penStroke, color:this.ctx.strokeStyle, lineWidth: this.ctx.lineWidth} as action);
        penStroke = [];
      }
      else if (this.tool == "rectangle"){
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = this.mouseX - rect.x;
        let mouseY = this.mouseY - rect.y;

        this.ctx.strokeRect(startPoint.x, startPoint.y, mouseX - startPoint.x, mouseY - startPoint.y);

        this.actions.push({tool: "rectangle", path: [startPoint, {x:mouseX - startPoint.x, y:mouseY - startPoint.y}], color:this.ctx.strokeStyle, lineWidth: this.ctx.lineWidth} as action);
      }
      else if (this.tool == "elipse"){
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = this.mouseX - rect.x;
        let mouseY = this.mouseY - rect.y;

        let centerX = startPoint.x + (mouseX - startPoint.x) / 2
        let centerY = startPoint.y + (mouseY - startPoint.y) / 2

        let rx = Math.abs(mouseX - startPoint.x) / 2;
        let ry = Math.abs(mouseY - startPoint.y) / 2;


        this.ctx.beginPath();
        this.ctx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI, false);
        this.ctx.stroke();

        this.actions.push({tool: "elipse", path: [{x:centerX, y:centerY}, {x:rx, y:ry}], color:this.ctx.strokeStyle, lineWidth: this.ctx.lineWidth} as action);
      }
      else if (this.tool == "line"){
        let rect = this.canvas.getBoundingClientRect();
        let mouseX = this.mouseX - rect.x;
        let mouseY = this.mouseY - rect.y;

        this.ctx.beginPath();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(mouseX, mouseY);
        this.ctx.stroke();

        this.actions.push({tool: "line", path: [startPoint, {x:mouseX, y:mouseY}], color:this.ctx.strokeStyle, lineWidth: this.ctx.lineWidth} as action);
      }
    });

    window.addEventListener('mousemove', (e) => {

      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (this.tool == "pen"){

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
    this.ctx.fillStyle = value;
  }

  undoAction(){
    this.draw = false;

    console.log(this.actions)

    this.actions.pop();
    
    this.drawingFromActions();
  }

  drawingFromActions(){
    this.clearCanvas();
    
    this.actions.forEach((act:action) =>{
      this.ctx.lineWidth = act.lineWidth;
      this.ctx.strokeStyle = act.color;

      if (act.tool == "pen" || act.tool == "line"){
        for (let i = 1; i < act.path.length; i++){
          this.ctx.beginPath();

          this.ctx.moveTo(act.path[i-1].x, act.path[i-1].y);
          this.ctx.lineTo(act.path[i].x, act.path[i].y);

          this.ctx.stroke();

          this.ctx.closePath();
        }
      }
      else if (act.tool == "rectangle"){
        this.ctx.strokeRect(act.path[0].x, act.path[0].y, act.path[1].x, act.path[1].y);
      }
      else if (act.tool == "elipse"){
        this.ctx.beginPath();
        this.ctx.ellipse(act.path[0].x, act.path[0].y, act.path[1].x, act.path[1].y, 0, 0, 2 * Math.PI, false);
        this.ctx.stroke();
      }
      else if (act.tool == "clear"){
        this.clearCanvas();
      }
      else if (act.tool == "fill"){
        console.log("fillCalled")
        console.log(act.path[0].y)
        this.floodFill(this.ctx, act.path[0].x, act.path[0].y, this.hexToRgb(act.color));
      }

    })

    
    this.changeLineSize();
    this.changeColor();
  }

  clearCanvas(){
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  clearCanvasTool(){
    this.clearCanvas();

    this.actions.push({tool:"clear", path: [], color: "na", lineWidth:this.ctx.lineWidth} as action)
  }

  mouseOnCanvas():boolean{
    let rect = this.canvas.getBoundingClientRect();

    if (this.mouseX > rect.x && this.mouseY > rect.y && this.mouseX < rect.x + rect.width && this.mouseY < rect.y + rect.height){
      return true;
    }
    return false;
  }

  changeLineSize():void{
    this.ctx.lineWidth = parseInt((document.getElementById("line-size") as HTMLInputElement).value);
  }

  selectTool(tool:string): void{
    this.tool = tool;
  }

  getPixel(imageData, x, y) {
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
      return [-1, -1, -1, -1];  // impossible color
    } else {
      const offset = (y * imageData.width + x) * 4;
      return imageData.data.slice(offset, offset + 4);
    }
  }
  
  setPixel(imageData, x, y, color) {
    const offset = (y * imageData.width + x) * 4;
    imageData.data[offset + 0] = color[0];
    imageData.data[offset + 1] = color[1];
    imageData.data[offset + 2] = color[2];
    imageData.data[offset + 3] = color[3];
  }
  
  colorsMatch(a, b, rangeSq = 1) {
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    const da = a[3] - b[3];
    return dr * dr + dg * dg + db * db + da * da < rangeSq;
  }
  
  floodFill(ctx, x, y, fillColor, range = 1) {
    // read the pixels in the canvas
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // flags for if we visited a pixel already
    const visited = new Uint8Array(imageData.width, imageData.height);
    
    // get the color we're filling
    const targetColor = this.getPixel(imageData, x, y);
    
    // check we are actually filling a different color
    if (!this.colorsMatch(targetColor, fillColor)) {
  
      const rangeSq = range * range;
      const pixelsToCheck = [x, y];
      while (pixelsToCheck.length > 0) {
        const y = pixelsToCheck.pop();
        const x = pixelsToCheck.pop();
        
        const currentColor = this.getPixel(imageData, x, y);
        if (!visited[y * imageData.width + x] &&
          this.colorsMatch(currentColor, targetColor, rangeSq)) {
          this.setPixel(imageData, x, y, fillColor);
          visited[y * imageData.width + x] = 1;  // mark we were here already
          pixelsToCheck.push(x + 1, y);
          pixelsToCheck.push(x - 1, y);
          pixelsToCheck.push(x, y + 1);
          pixelsToCheck.push(x, y - 1);
        }
      }
      
      // put the data back
      ctx.putImageData(imageData, 0, 0);
    }
  }
  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16), 255];
  }
}
