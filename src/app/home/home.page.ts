import { Component } from '@angular/core';

import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { ActionSheetController, ToastController, NavController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { DataService } from '../services/data.service';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    images: any;
    coord: any;
    fotoData: any;

    constructor(private camera: Camera, private nav: NavController, private actionSheetController: ActionSheetController,
                private toastController: ToastController, private geolocation: Geolocation, private dataService: DataService
    ) {
    }

    // store the data, so other views can load it later.
    // call the view informacao.
    onClick() {
        this.dataService.setData(1, {imagem: this.fotoData, coords: this.coord});
        this.nav.navigateForward('/informacao/1');
    }

    // show text on the screen
    async presentToast(text) {
        const toast = await this.toastController.create({
            message: text,
            position: 'bottom',
            duration: 3000
        });
        toast.present();
    }

    // select the origin of the image.
    // Start capture process.
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

    // Take photo and it's gps(lat,long), with the options declared.
    // missing: if gps is not active or can not get information it should cancel/restart the process and show message.
    takePicture(sourceType: PictureSourceType) {
        this.images = '';
        const options: CameraOptions = {
            // allowEdit: true,
            correctOrientation: true,
            destinationType: this.camera.DestinationType.DATA_URL,
            quality: 50,
            sourceType,
            saveToPhotoAlbum: false,
            encodingType: this.camera.EncodingType.JPEG,
        };

        this.camera.getPicture(options)
            .then(imagePath => {
                this.images = 'data:image/jpeg;base64,' + imagePath;
                // console.log('imagepath,', imagePath);
                // console.log(' this.images',  this.images);
                // const blob = this.b64toBlob(imagePath, 'image/jpeg');
                // console.log(' blob',  blob);
                // const url = URL.createObjectURL(blob);
                // console.log(' url',  url);
                this.fotoData = imagePath;

                this.geolocation.getCurrentPosition()
                    .then((resp) => {
                        this.coord = resp;
                        // resp.coords.latitude
                        // resp.coords.longitude
                    }).catch((error) => {
                        // console.log('Error getting location', error);
                        this.presentToast('Gps desativado/bloqueado.');
                    });
            }).catch(err => {
                this.presentToast('Erro na captura da imagem.');
            });
    }

    // I don't know what this do. Only that is needed.
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
}
