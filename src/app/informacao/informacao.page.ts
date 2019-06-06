import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ToastController, LoadingController } from '@ionic/angular';
import { HTTP } from '@ionic-native/http/ngx';

@Component({
  selector: 'app-informacao',
  templateUrl: './informacao.page.html',
  styleUrls: ['./informacao.page.scss'],
})
export class InformacaoPage implements OnInit {

  dados: any;
  dadosForm: FormGroup;

  constructor(public formBuilder: FormBuilder, private loadingController: LoadingController, private http: HTTP,
              private toastController: ToastController, private route: ActivatedRoute) {
    this.dadosForm = this.formBuilder.group({
      numero_carro: new FormControl('', Validators.compose([
        Validators.required,
        // buscar padrão só de numeros
        // Validators.pattern()
      ])),
      numero_linha: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(3),
        // buscar padrão só de numeros
        // Validators.pattern()
      ])),
    });
  }

  ngOnInit() {
    if (this.route.snapshot.data.special) {
      this.dados = this.route.snapshot.data.special;
    }
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

  async startUpload() {
    console.log('coord:', this.dados.dados);
    console.log('formulario:', this.dadosForm.value);
    console.log('imagem:', this.dados.imagem);

    const postData = new FormData();
    postData.append('image', this.dados.imagem);
    postData.append('coord', this.dados.dados);
    postData.append('formulario', this.dadosForm.value);

    const loading = await this.loadingController.create({
      message: 'Uploading ...',
    });
    await loading.present();

    this.http.post('http://api-denuncia.herokuapp.com/api/v1/complaint', postData, {})
      .then(data => {
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
