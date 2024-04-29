import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RobotGet {
    id: number;
    robotId: number;
    name: string;
    status: number;
}

export interface RandomUser {
    id: number;
    robotId: number;
    devicename: string;
    getby: number;
    date: string;
    name: string;
    result: string;
    status: string;
    imgpath: string;
}

export interface Presetslist {
    id: number;
    p: number;
    t: number;
    z: number;
    device: number;
    robotId: number;
    slidePresetId: number;
    dataInfoId: string;
}

@Injectable({ providedIn: 'root' })
export class GetDataService {

    // private readonly http: HttpClient;
    public constructor(private readonly http: HttpClient) { }

    public getUsers(
        robotId: number,
        devicename: string,
        startendTime: Array<Date>,
    ): Observable<{ data: Array<RandomUser> }> {
        let params: HttpParams = new HttpParams();
        if (startendTime.length) {
            params = params
                .append('robotId', robotId.toString())
                .append('deviceName', devicename)
                .append('startTime', this.returnDate(startendTime[0]))
                .append('endTime', this.returnDate(startendTime[1]));
        } else {
            params = params
                .append('robotId', robotId.toString())
                .append('deviceName', devicename);
        }

        return this.http.get<{ data: Array<RandomUser> }>(`${environment.apiUrl}/hkipc/queryAllData`, { params }).pipe(catchError(() => of({ data: [] })));
    }

    public getButtoneed(
        robotId: number,
    ): Observable<{ data: Array<RobotGet> }> {
        const params: HttpParams = new HttpParams().append('robotId', robotId.toString());
        return this.http.get<{ data: Array<RobotGet> }>(`${environment.apiUrl}/hkipc/queryDevice`, { params })
            .pipe(catchError(() => of({ data: [] })));
    }

    public returnDate(date?: Date): string | number {
        if (date) {
            const formattedDate: string = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
            return formattedDate.toString();
        }
        return 0;
    }

    // 获取预置点列表
    public getPreset(
        robotId: number,
    ): Observable<{ data: Array<Presetslist> }> {
        const params: HttpParams = new HttpParams().append('robotId', robotId.toString());
        return this.http.get<{ data: Array<Presetslist> }>(`${environment.apiUrl}/hkipc/queryPresets`, { params }).pipe(catchError(() => of({ data: [] })));
    }

}
