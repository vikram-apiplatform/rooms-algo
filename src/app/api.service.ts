import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpResponse, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  httpOptions: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private http: HttpClient) {
  }

  helloWorld() {
    const url = 'http://127.0.0.1:5003/hello';
    return this.http.get(url, this.httpOptions)
      .pipe(map(res => res));
  }

  getBuildingNumber(payload:any) {
    const url = 'http://127.0.0.1:5003/get_building_number';
    return this.http.post(url,payload, this.httpOptions)
      .pipe(map(res => res));
  }

  get_rooms(payload:any) {
    const url = 'http://127.0.0.1:5003/get_rooms';
    return this.http.post(url,payload, this.httpOptions)
      .pipe(map(res => res));
  }
}
