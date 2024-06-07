import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, ElementRef, Input, Renderer2, ViewChild, WritableSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSegmentedComponent, NzSegmentedOption } from 'ng-zorro-antd/segmented';
import { Area, AreaService } from '../../app/services/area.service';
import { Droid, DroidService } from '../../app/services/droid.service';
// eslint-disable-next-line @typescript-eslint/naming-convention
import Hls from 'hls.js';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule, NzTableSize } from 'ng-zorro-antd/table';
import { GetDataService, RandomUser, NowUser, RobotGet, Presetslist } from '../../app/services/getdata.service';
import { HkIpcService } from '../../app/services/hkipc.service';
import { InteractionService } from '../../app/services/interaction.service';
import { environment } from '../../environments/environment';
import zh from '@angular/common/locales/zh';

registerLocaleData(zh);

@Component({
    imports: [
        NzCardComponent,
        NzSegmentedComponent,
        NzIconDirective,
        NzButtonComponent,
        NzModalModule,
        CommonModule,
        NzTableModule,
        NzDropDownModule,
        FormsModule,
        NzDatePickerModule,
    ],
    standalone: true,
    selector: 'mre-overview',
    templateUrl: './robotsstatues.component.html',
    styleUrl: './robotsstatues.component.scss',
})
export class RobotsstatuesComponent {

    @ViewChild('liveHolder', { read: ElementRef })
    private readonly liveHolderRef?: ElementRef<HTMLDivElement>;

    public area?: Area;

    public droids?: Array<Droid>;

    public isLive: WritableSignal<boolean | undefined> = signal<boolean | undefined>(undefined);

    public droidOptions: Array<NzSegmentedOption> = new Array<NzSegmentedOption>();

    public isVisible?: boolean = false;

    public isVisiblepic?: boolean = false;

    public total: number = 1;

    public listOfRandomUser: Array<RandomUser> = [];

    public tempUser: Array<RandomUser> = [];

    public userNowLi: Array<NowUser> = [];

    public listOfrobotGet: Array<RobotGet> = [];

    public listOfPresets: Array<Presetslist> = [];

    public loading: boolean = true;

    public pageSize: number = 10;

    public ageIndex: number = 1;

    public size: NzTableSize = 'small';

    public date: null = null;

    public detecTime: null = null;

    public robotId: number = 1;

    public deviceName: string = 'none';

    public pageIndex: number = 1;

    public modalWidth: string = 'auto';

    public buttonText: string = '筛选条件';

    public picpath: string = '';

    public widthnz: string = '80%';

    public picwidthnz: string = '55%';

    public yuzhiwidthnz: string = '50%';

    public picwidth: string = 'auto';

    public picheight: string = 'auto';

    public imageWidth: string = '100%';

    public imageHeight: string = '100%';

    public isVisiblepos?: boolean = false;

    public modeNow: string = '';

    public presetNow: string = '';

    public timeSetNow: string = '';

    private liveVideoNode?: HTMLVideoElement;

    private liveHls?: Hls;

    public constructor(
        private readonly renderer: Renderer2,
        private readonly areaService: AreaService,
        private readonly droidService: DroidService,
        private readonly ipcService: HkIpcService,
        private readonly interaction: InteractionService,
        private readonly randomUserService: GetDataService,
    ) { }

    // 是
    @Input()
    private set areaId(thevalue: string) {
        if (!thevalue) { return; }
        this.disposeLive();
        const value: Array<string> = thevalue.split('|');
        this.area = this.areaService.getById(value[0]) ?? undefined;
        this.droids = this.droidService.getByArea(value[0]);

        if (Array.isArray(this.droids) && this.droids.length > 0) {
            this.droidOptions = this.droids.map<NzSegmentedOption>(i => ({ label: i.name, value: i.id, icon: 'video-camera' }));
            this.robotId = Number(value[1]);
            this.getDevice();

            this.changeColor();
            this.freashSomestatus();
            setInterval(() => {
                this.changeColor();
            }, 10000);
            setInterval(() => {
                // console.log("已发送")
                this.freashSomestatus();
                //下面两个函数封到一起
                this.Mengban();

            }, 3000);
        } else {
            this.droidOptions = new Array<NzSegmentedOption>();
        }
        void this.onLiveClick();
    }

    public async setIntervalTime():Promise<void>{
        const intervalTime = (document.getElementById("text-input") as HTMLInputElement);

        // console.log(intervalTime.value);

        if(Number(intervalTime.value) > 1 || Number(intervalTime.value) < 1441)
            this.randomUserService.setIntervalNow(this.robotId, intervalTime.value).subscribe(data => {
                console.log(data.data);
            });
        else{
            await this.interaction.toast('请输入1-1440的数字, 即1分钟到24小时!', { type: 'error' });
        }
        this.freashSomestatus();


    }
    public Mengban(){
        // const list = [];
        this.randomUserService.getRealTime(this.robotId).subscribe(data => {
            // if(Array.isArray(data.data)){
            // console.log(data.data)
            if(data!=null){
                this.title(data.data[0],data.data[data.data.length-1])
                this.freshMengban(data.data.slice(1),data.data[data.data.length-1]);
            }
            // }
        });
    }
    public freshMengban(lis:Array<String>, ISON:String):void{
        // 首先接收一下文字

        var textElement = document.getElementById("mengban1");
        if (textElement) {
            // JavaScript 中的变量，可以是任何你想要的值
            if (ISON=='ON'){
                var text =
                '送风机运行状态：'+ lis[0] + '\n' +
                '送风机报警状态：\t\t'+ lis[1] + '\n' +
                '排风机运行状态：\t\t'+ lis[2] + '\n' +
                '排风机报警状态：\t\t'+ lis[3] + '\n' +
                '浸水状态：\t\t'+ lis[4] + '\n' +
                '回风温度：\t\t'+ lis[5] + '\n' +
                '回风湿度：\t\t'+ lis[6] + '\n' +
                '送风温度：\t\t'+ lis[7] + '\n' +
                '送风压力：\t\t'+ lis[8] + '\n' +
                '烟雾浓度：\t\t'+ lis[9] ;
            }else{
                var text = '';
            }
            // 将文本元素的内容设置为 JavaScript 变量的值
            textElement.innerText = text;
        } else {
            console.error("无法找到指定的文本元素！");
        }
    }
    public title(tex: String, ISON:String):void{
        // 首先接收一下文字

        var textElement = document.getElementById("mengban0");
        if (textElement) {
            if (ISON=='ON'){
                // JavaScript 中的变量，可以是任何你想要的值
                var text =
                '当前巡检位置：'+ tex + '\n\n';
            }else{
                var text = '';
            }

            // 将文本元素的内容设置为 JavaScript 变量的值
            textElement.innerText = text;
        } else {
            console.error("无法找到指定的文本元素！");
        }
    }

    public freashSomestatus(){
        this.randomUserService.getIntervalNow(this.robotId).subscribe(data => {
            const match = data.data.match(/(\d+) minutes/)
            // 巡检间隔
            if (match) {
                const minutes = match[1];
                this.timeSetNow = minutes+'分钟';
            } else {
                this.timeSetNow = '';
            }
            // 模式
            const match2 = data.data.match(/not found service for robot/)// 说明没有服务
            if (match2) {
                this.modeNow = ' 手动控制';
            } else {
                this.modeNow = ' 自动巡检';//隐藏一下
                // 隐藏标签
                var elements = document.querySelectorAll("[id='dddd']");
                elements.forEach(function(element) {
                    if (element instanceof HTMLElement) {
                        element.style.display = "none";
                    }
        });
            }
        });
        this.randomUserService.getPresetNow(this.robotId).subscribe(data => {
            // 预置点
            const match3 = data.data.match(/\d+/)// 说明没有服务
            if (match3) {
                this.presetNow = match3.toString();
            } else {
                this.presetNow = '';
            }
        });
    }

    public changeColor(): void {
        this.randomUserService.getButtoneed(this.robotId).subscribe(data => {
            this.loading = false;
            this.total = 200;
            data.data.forEach(innerData => {
                this.changeButtonColor(innerData.name, innerData.status);
            });
        });
    }

    public showModal(deviceName: string): void {
        this.isVisible = true;
        this.deviceName = deviceName;
        this.loadDataFromServer(this.robotId, this.deviceName, []);
    }

    public returnback(): void {
        this.buttonText = '筛选条件';
        this.loadDataFromServer(this.robotId, this.deviceName, []);
    }

    public handleCancel(): void {
        this.isVisible = false;
    }

    public getPath(): string {
        return `${environment.apiUrl}/${this.picpath}`;
    }

    public handleCancelpic(): void {
        this.isVisiblepic = false;
    }

    public showPic(path: string): void {
        this.isVisiblepic = true;
        this.picpath = path;
    }

    public handlePosition(): void {
        this.isVisiblepos = false;
    }

    public showPosition(): void {
        this.isVisiblepos = true;
        this.loadPresetFromServer(this.robotId);
    }

    public getDevice(): void {
        this.loading = true;
        this.randomUserService.getButtoneed(this.robotId).subscribe(data => {
            this.loading = false;
            this.total = 200;
            // const sortedStrings = data.data.sort((a, b) => {
            //     const numA = parseInt(a.replace(/\D/g, ''), 10);
            //     const numB = parseInt(b.replace(/\D/g, ''), 10);
            //     return numA - numB;
            // });
            // -\d+
            // data.data.forEach(innerData => {
            //     // console.log(innerData.name);
            //     this.createButton(innerData.name, innerData.status);
            // });
            data.data.sort((a, b) => {
                const matchA = a.name.match(/-\d+/);
                var numbera = null;
                if (matchA) {
                    numbera = parseInt(matchA[0]);
                }
                const matchB = b.name.match(/-\d+/);
                var numberb = null;
                if (matchB) {
                    numberb = parseInt(matchB[0]);
                }
                if (numbera!=null && numberb!=null){
                    return numberb-numbera;
                }else{
                    return 0;
                }
            });
            data.data.forEach(innerData => {
                    // console.log(innerData.name);
                    this.createButton(innerData.name, innerData.status);
            });

        });
    }



    public changeButtonColor(buttonname: string, status: number): void {
        const buttons: NodeListOf<Element> = document.querySelectorAll('.device');
        buttons.forEach((button: Element) => {
            const htmlButton: HTMLButtonElement = button as HTMLButtonElement;
            if (htmlButton.textContent?.slice(0, -2) == buttonname) {
                const color1: string = 'rgb(96, 241, 96)';
                const color2: string = 'red';

                const chineseSpan: HTMLSpanElement | null = htmlButton.querySelector('span');
                if (!chineseSpan) { return; }

                if (status === 0) {
                    chineseSpan.style.backgroundColor = color1;
                    chineseSpan.style.border = `5px solid ${color1}`;
                    htmlButton.style.border = `2px solid ${color1}`;
                } else if (status === 1) {
                    chineseSpan.style.backgroundColor = color2;
                    chineseSpan.style.border = `5px solid ${color2}`;
                    htmlButton.style.border = `2px solid ${color2}`;
                }
            }
        });
    }

    public async robotLeft(): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            await this.ipcService.robotLeft(droid.ipcId);
        }
    }

    public async robotRight(): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            await this.ipcService.robotRight(droid.ipcId);
        }
    }

    public createButton(buttonname: string, status: number): void {
        const container: HTMLElement | null = document.querySelector('.container');
        if (!container) { return; }

        const button: HTMLButtonElement = document.createElement('button');

        const stat: string = status == 0 ? '正常' : '异常';

        const chineseSpan: HTMLSpanElement = document.createElement('span');
        chineseSpan.style.display = 'inline-block';
        chineseSpan.style.margin = '0 0 0 0 px';
        chineseSpan.style.padding = '0 px';
        chineseSpan.textContent = `${stat}`;

        button.style.padding = '0';
        button.style.paddingLeft = '5px';
        button.style.cursor = 'pointer';
        const color1: string = 'rgb(96, 241, 96)';
        const color2: string = 'red';

        if (status == 0) {
            chineseSpan.style.backgroundColor = color1;
            chineseSpan.style.border = `5px solid ${color1}`;
            button.style.border = `2px solid ${color1}`;
        } else if (status == 1) {
            chineseSpan.style.backgroundColor = color2;
            chineseSpan.style.border = `5px solid ${color2}`;
            button.style.border = `2px solid ${color2}`;
        }

        button.textContent = buttonname;
        button.className = 'device';

        button.addEventListener('click', () => {
            this.showModal(`${buttonname}`);
        });

        button.append(chineseSpan);
        container.append(button);
    }

    public calculateMaxWidth(): number {
        return window.innerWidth * 0.7;
    }

    // 计算最大高度
    public calculateMaxHeight(): number {
        // 根据比例计算出最大高度
        return window.innerHeight * 0.5;
    }

    public loadDataFromServer(
        robotId: number,
        deviceName: string,
        startendTime: Array<Date>,
    ): void {
        this.loading = true;
        this.randomUserService.getUsers(robotId, deviceName, startendTime).subscribe(data => {
            this.loading = false;
            this.total = 200;
            // console.log(data.data)
            // // for(const a : data.data)
            // data.data.forEach(function(element) {
            // if(element.status == '1'){
            //     console.log(element);
            // }

            // });
            // var temp = this.converterDate(data.data[0].date);

            // var ind = 1;
            // var temp = data[0].date;
            // for (const user of data.data.slice(1)) {
            //     // this.tempUser.push(user);
            //     var thistime = this.converterDate(user.date)

            //     if (thistime-temp < 10 && thistime-temp > -10){
            //         this.tempUser.push(user); // 推入数组
            //     } else {
            //         // console.log(this.tempUser)
            //         // break;
            //         this.userNowLi.push(this.all2Now( this.tempUser))
            //         this.tempUser.length = 0;
            //         this.tempUser.push(user);
            //         // ind++;
            //     }
            //     temp = thistime;
            // }

            this.userNowLi = data.data;
        });
    }

    // 获取预置点
    public loadPresetFromServer(
        robotId: number,
    ): void {
        this.loading = true;
        this.randomUserService.getPreset(robotId).subscribe(data => {
            this.loading = false;
            this.total = 200;
            this.listOfPresets = data.data;
        });
    }

    public onChange(result: Array<Date>): void {
        this.loadDataFromServer(this.robotId, this.deviceName, result);
    }

    public doCheck(type: string): void {
        const currentDate: Date = new Date();
        const pastDate: Date = new Date(currentDate);
        if (type == 'a') {
            pastDate.setHours(currentDate.getHours() - 24);
            this.buttonText = '最近24小时';
        } else if (type == 'b') {
            pastDate.setHours(currentDate.getHours() - (24 * 7));
            this.buttonText = '最近7天';
        } else if (type == 'c') {
            pastDate.setHours(currentDate.getHours() - (24 * 31));
            this.buttonText = '最近一个月';
        }
        this.loadDataFromServer(this.robotId, this.deviceName, [pastDate, currentDate]);
    }

    public async gotoApreset(presetId: number): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            await this.ipcService.gotoPreset(droid.ipcId, presetId);
        }
    }

    public async onLiveClick(): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            this.disposeLive();
            this.isLive.set(false);
            await this.loadLive(droid.ipcId);
        } else {
            await this.interaction.toast('没有找到当前机器人相关的摄像头信息');
        }
    }

    public async onSelectDroid(index: number): Promise<void> {
        this.robotId = index;
        if (this.isLive() ?? false) {
            this.disposeLive();
            await this.onLiveClick();
        }
    }

    public async onIpcControl(action: 'up' | 'down' | 'left' | 'right'): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            switch (action) {
                case 'up':
                    await this.ipcService.tilt(droid.ipcId, 'up');
                    break;
                case 'down':
                    await this.ipcService.tilt(droid.ipcId, 'down');
                    break;
                case 'left':
                    await this.ipcService.pan(droid.ipcId, 'left');
                    break;
                case 'right':
                    await this.ipcService.pan(droid.ipcId, 'right');
                    break;
                default:
                    break;
            }
        }
    }

    public async onIpcFocal(action: 'in' | 'out'): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            switch (action) {
                case 'in':
                    await this.ipcService.zoom(droid.ipcId, 'in');
                    break;
                case 'out':
                    await this.ipcService.zoom(droid.ipcId, 'out');
                    break;
                default:
                    break;
            }
        }
    }

    public async startCheck(): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            await this.ipcService.startTimer(droid.ipcId);
        }

        // 隐藏标签
        var elements = document.querySelectorAll("[id='dddd']");
        elements.forEach(function(element) {
            if (element instanceof HTMLElement) {
                element.style.display = "none";
            }
        });

    }

    public async stopCheck(): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            await this.ipcService.stopTimer(droid.ipcId);
        }
        var elements = document.querySelectorAll("[id='dddd']");
        elements.forEach(function(element) {
            if (element instanceof HTMLElement) {
                element.style.display = "block";
            }
        });
    }

    public async onSnapshot(): Promise<void> {
        if (typeof this.robotId != 'number') { return; }
        const droid: Droid | undefined = this.droids?.[this.robotId - 1];
        if (droid?.ipcId) {
            const res: string = await this.ipcService.snapshot(droid.ipcId);
            if (res) {
                this.showPic(res);
            }
        }
    }

    private async loadLive(ipcId: string): Promise<void> {
        const liveUrl: string = await this.ipcService.getLiveUrl(ipcId);
        if (!liveUrl) {
            this.isLive.set(undefined);
            await this.interaction.toast('获取当前摄像头实时监控失败');
            return;
        }

        this.liveVideoNode = document.createElement('video');

        this.liveHls = new Hls();
        this.liveHls.loadSource(liveUrl);
        this.liveHls.attachMedia(this.liveVideoNode);
        this.liveVideoNode.autoplay = true;
        this.liveVideoNode.muted = true;
        this.liveHls.once(Hls.Events.MANIFEST_LOADED, () => {
            this.renderer.appendChild(this.liveHolderRef?.nativeElement, this.liveVideoNode);
            this.isLive.set(true);
        });
    }

    private disposeLive(): void {
        this.liveVideoNode?.remove();
        this.liveHls?.destroy();
        this.isLive.set(undefined);
    }

}
