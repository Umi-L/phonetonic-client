import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataPassService {

  data:any;
  authData:any;

  constructor() { }

  getData(){
    return this.data;
  }

  setData(_data){
    this.data = _data;
  }
}