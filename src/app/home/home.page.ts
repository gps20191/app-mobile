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
    dados: any;

    constructor(private camera: Camera, private nav: NavController, private actionSheetController: ActionSheetController,
                private toastController: ToastController, private geolocation: Geolocation, private dataService: DataService
    ) {
    }

    // aciona tela de informações adicionais
    onClick() {
        this.dataService.setData(1, {imagem: this.images, dados: this.dados});
        this.nav.navigateForward('/informacao/1');
    }

    // mostra mensagem na tela
    async presentToast(text) {
        const toast = await this.toastController.create({
            message: text,
            position: 'bottom',
            duration: 3000
        });
        toast.present();
    }

    // determina a origem da foto, camera ou galeria.
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

    // pega foto da biblioteca ou da camera, sende este configuravel.
    // falta: se não ativiar gps ou não conseguir informações deve cancelar/reiniciar o processo e mostrar mensagem.
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
                        // console.log(resp);
                        this.dados = resp;
                        // resp.coords.latitude
                        // resp.coords.longitude
                    }).catch((error) => {
                        console.log('Error getting location', error);
                        this.presentToast('Gps desativado/bloqueado.');
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
}
