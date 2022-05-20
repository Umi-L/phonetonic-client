import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-drawing',
  templateUrl: './drawing.page.html',
  styleUrls: ['./drawing.page.scss'],
})
export class DrawingPage implements OnInit {
  constructor() { }

  public canvas:HTMLCanvasElement;
  public ctx:CanvasRenderingContext2D;

  ngOnInit() {
    console.log('started');

    this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this.canvas.height = 700;
    this.canvas.width = 700;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 5;

    let prevX = null;
    let prevY = null;

    let draw = false;

    document.getElementById("picker").onchange = this.changeColor;

    // let clrs: any = document.querySelectorAll('.clr');
    // clrs = Array.from(clrs);
    // clrs.forEach((clr) => {
    //   clr.addEventListener('click', () => {
    //     ctx.strokeStyle = clr.dataset.clr;
    //   });
    // });

    // let clearBtn = document.querySelector('.clear');
    // clearBtn.addEventListener('click', () => {
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    // });

    // let saveBtn = document.querySelector('.save');
    // saveBtn.addEventListener('click', () => {
    //   let data = canvas.toDataURL('imag/png');
    //   let a = document.createElement('a');
    //   a.href = data;
    //   a.download = 'sketch.png';
    //   a.click();
    // });

    window.addEventListener('mousedown', (e) => (draw = true));
    window.addEventListener('mouseup', (e) => (draw = false));

    window.addEventListener('mousemove', (e) => {
      let rect = this.canvas.getBoundingClientRect();

      if (prevX == null || prevY == null || !draw) {
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

      prevX = mouseX;
      prevY = mouseY;
    });
  }

  changeColor = () => {
    let value = (<HTMLInputElement>document.getElementById("picker")).value;
    this.ctx.strokeStyle = value;

    console.log(value);
  }
}
