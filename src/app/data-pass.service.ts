import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataPassService {

  data:any;
  promptData:any;

  constructor() { }

  getData(){
    return this.data;
  }

  setData(_data){
    this.data = _data;
  }

  getPromptData(){
    return this.promptData;
  }

  setPromptData(_data){
    this.promptData = _data;
  }
}