import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { load } from '@angular/core/src/render3';

import { ToastController, LoadingController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

import { Observable } from 'rxjs';

@Component({
  selector: 'app-informacao',
  templateUrl: './informacao.page.html',
  styleUrls: ['./informacao.page.scss'],
})
export class InformacaoPage implements OnInit {

  dados: any;
  dadosForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private loadingController: LoadingController,
    // public http: HttpClient,
    public http: HTTP,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private transfer: FileTransfer,
    ) {
      this.dadosForm = this.formBuilder.group({
      numero_carro: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('[0-9]{5}')
      ])),
      numero_linha: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('[0-9]{3,4}')
      ])),
    });
  }

  // load storaged data.
  ngOnInit() {
    if (this.route.snapshot.data.special) {
      this.dados = this.route.snapshot.data.special;
    }
  }

  // show text on screen
  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 3000
    });
    toast.present();
  }

  // start upload process, using data from ngOnInit().
  async startUpload() {
    console.log('\n\ncoord:', this.dados.coords);
    console.log('formulario:', this.dadosForm.value);
    console.log('imagem:', this.dados.imagem);

    const loading = await this.loadingController.create({
      message: 'Uploading ...',
    });
    await loading.present();

    const urlSample = 'http://api-denuncia.herokuapp.com/api/v1/complaint';
    const postData = new FormData();
    postData.append('imagem', this.dados.imagem);
    postData.append('coord', this.dados.coords);
    postData.append('formulario', this.dadosForm.value);

    // const fileTransfer: FileTransferObject = this.transfer.create();
    // const options: FileUploadOptions = {
    //   fileKey: 'image',
    //   fileName: 'image',
    //   chunkedMode: false,
    //   mimeType: 'image/jpeg',
    //   headers: {}
    // };

    // fileTransfer.upload(this.dados.imagem, urlSample, options)
    //   .then((data) => {
    //   console.log(data + ' Uploaded Successfully');
    //   loading.dismiss();
    //   this.presentToast('Image uploaded successfully');
    // }, (err) => {
    //   console.log(err);
    //   loading.dismiss();
    //   this.presentToast(err);
    // });

    // const data: Observable<any> = this.http.post(urlSample, this.dados.imagem);
    // data.subscribe((result) => {
    //   console.log(result);
    //   this.presentToast('Concluido');
    // }, error => {
    //   console.log('ops', error);
    //   this.presentToast('Falha');
    // });
    // loading.dismiss();

    this.http.post(urlSample, {image: this.dados.imagem}, {})
      .then(data => {
        console.log('Concluido.');
        console.log(data.status);
        console.log(data.data); // data received by server
        console.log(data.headers);
        loading.dismiss();
        this.presentToast('Concluido.');
      })
      .catch(error => {
        console.log(error.status);
        console.log(error.error); // error message as string
        console.log(error.headers);
        loading.dismiss();
        this.presentToast('Falha ao enviar.');
      });
  }

}
