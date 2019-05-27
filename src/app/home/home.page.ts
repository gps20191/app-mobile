import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { ActionSheetController, ToastController, LoadingController, NavController, ModalController } from '@ionic/angular';
import { File } from '@ionic-native/File/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { finalize } from 'rxjs/operators';
import { post } from 'selenium-webdriver/http';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    images: any;

    constructor(private camera: Camera, private file: File, private webview: WebView, private nav: NavController,
                private actionSheetController: ActionSheetController, private toastController: ToastController,
                private loadingController: LoadingController, private geolocation: Geolocation,
                private http: HttpClient, private modalController: ModalController) {
    }

    onClick() {
        this.nav.navigateForward('informacao');
    }

    async presentToast(text) {
        const toast = await this.toastController.create({
            message: text,
            position: 'bottom',
            duration: 3000
        });
        toast.present();
    }

    async selectImage() {
        const actionSheet = await this.actionSheetController.create({
            header: 'Escolha a origem',
            buttons: [{
                text: 'Galeria',
                handler: () => {
                    this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
                }
            },
            {
                text: 'Camera',
                handler: () => {
                    this.takePicture(this.camera.PictureSourceType.CAMERA);
                }
            },
            {
                text: 'Cancelar',
                role: 'cancelar'
            }
            ]
        });
        await actionSheet.present();
    }

    takePicture(sourceType: PictureSourceType) {
        this.images = '';
        const options: CameraOptions = {
            // allowEdit: true,
            correctOrientation: true,
            destinationType: this.camera.DestinationType.DATA_URL,
            quality: 10,
            sourceType,
            saveToPhotoAlbum: false,
            encodingType: this.camera.EncodingType.JPEG,
        };

        this.camera.getPicture(options)
            .then(imagePath => {
                this.images = 'data:image/jpeg;base64,' + imagePath;
                const blob = this.b64toBlob(imagePath, 'image/jpeg');
                const url = URL.createObjectURL(blob);

                this.geolocation.getCurrentPosition()
                    .then((resp) => {
                        console.log(resp);
                        // resp.coords.latitude
                        // resp.coords.longitude
                    }).catch((error) => {
                        console.log('Error getting location', error);
                    });
            }).catch(err => {
                this.presentToast('Erro na captura da imagem.');
            });
    }

    private b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    async startUpload(imgEntry) {
        const postData = new FormData();
        postData.append('image', imgEntry);

        const loading = await this.loadingController.create({
            message: 'Uploading image...',
        });
        await loading.present();

        this.http.post('http://api-denuncia.herokuapp.com/api/v1/complaint', "dados", {})
        .pipe(
            finalize(() => {
                loading.dismiss();
            })
        )
        .subscribe(res => {
            console.log(res);
            if (res['success']) {
                this.presentToast('File upload complete.');
            } else {
                this.presentToast('File upload failed.');
            }
        });
    }
}
