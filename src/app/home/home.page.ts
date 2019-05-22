import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/Camera/ngx';
import { ActionSheetController, ToastController, Platform, LoadingController } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { HttpClient } from '@angular/common/http';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Storage } from '@ionic/storage';
import { FilePath } from '@ionic-native/file-path/ngx';

import { finalize } from 'rxjs/operators';
import { post } from 'selenium-webdriver/http';

const STORAGE_KEY = 'my_images';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    images: any;

    constructor(private camera: Camera, private file: File, private http: HttpClient, private webview: WebView,
                private actionSheetController: ActionSheetController, private toastController: ToastController,
                private plt: Platform, private loadingController: LoadingController,
                private filePath: FilePath) {
    }

    pathForImage(img) {
        if (img === null) {
            return '';
        } else {
            const converted = this.webview.convertFileSrc(img);
            return converted;
        }
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
        const options: CameraOptions = {
            // allowEdit: true,
            correctOrientation: true,
            destinationType: this.camera.DestinationType.DATA_URL,
            quality: 10,
            sourceType,
            saveToPhotoAlbum: false,
            encodingType: this.camera.EncodingType.JPEG,
        };

        this.camera.getPicture(options).then(imagePath => {
            // console.log('aqui', imagePath);
            // const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
            // const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
            this.images = 'data:image/jpeg;base64,' + imagePath;
            const blob = this.b64toBlob(imagePath, 'image/jpeg');
            const url = URL.createObjectURL(blob);
            // this.startUpload(url, this.createFileName());
        })
            .catch(err => {
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

    createFileName() {
        const d = new Date(),
            n = d.getTime(),
            newFileName = n + '.jpg';
        return newFileName;
    }

    startUpload(imgEntry, namePhoto) {
        let postData = new FormData();
        postData.append('image', imgEntry);
        const oReq = new XMLHttpRequest();
        const server = 'http://192.168.1.1/upload.php';
        oReq.open('POST', server, true);
        // Send the proper header information along with the request
        // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        oReq.onload = function(oEvent) {
            // all done!
        };
        // Pass the blob in to XHR's send method
        oReq.send(postData);
        console.log('fim');
    }

    readFile(file: any) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const formData = new FormData();
            const imgBlob = new Blob([reader.result], {
                type: file.type
            });
            formData.append('file', imgBlob, file.name);

        };
        reader.readAsArrayBuffer(file);
    }
}

