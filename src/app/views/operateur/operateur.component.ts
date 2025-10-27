import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';

//const API_URL = 'https://api.districobon.com/operateurs';
const API_URL = 'http://127.0.0.1:5000/api/operateurs';

//const API_URL = "https://backend.districobon.com/api/operateurs";

@Component({
  selector: 'app-operateur',
  templateUrl: './operateur.component.html',
  styleUrls: ['./operateur.component.scss']
})
export class OperateurComponent implements OnInit {
  operateurs; // Liste des opérateurs
  newOperateurForm: FormGroup; // Formulaire pour créer un nouvel opérateur
  editOperateurForm: FormGroup;
  selectedOperateur: any;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
     private dl: DataLayerService,
  ) {
    // Initialisation du formulaire
    this.newOperateurForm = this.fb.group({
      nomoperateur: ['', Validators.required],
      adresse_email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      motdepasse: ['', Validators.required]
    });
    this.editOperateurForm = this.fb.group({
      nomoperateur: ['', Validators.required],
      adresse_email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      motdepasse: ['']
    });
  }

  ngOnInit(): void {
    this.loadOperateurs(); // Charger la liste des opérateurs au démarrage
  }

  // Charger la liste des opérateurs
  loadOperateurs() {
   this.dl.getOperateur()
     .subscribe((res: any) => {
      console.log(res)
      // Récupère uniquement le tableau des livraisons
      this.operateurs = res;


      //console.log('Livraisons chargées :', this.commandes);
      // Si tu veux utiliser la pagination de l’API
      //this.pagination = res.pagination;
    }, err => {
      console.error('Erreur lors du chargement OPERATEURS', err);
    });
  }

  // Ouvrir la modale pour créer un nouvel opérateur
  openNewOperateurModal(modal: TemplateRef<any>) {
    this.newOperateurForm.reset();
    this.modalService.open(modal, { size: 'lg' });
  }

  openEditOperateurModal(operateur: any, modal: TemplateRef<any>) {
    this.selectedOperateur = operateur;
    this.editOperateurForm.patchValue({
      nomoperateur: operateur.nomoperateur,
      adresse_email: operateur.adresse_email,
      telephone: operateur.telephone,
      motdepasse: ''
    });
    this.modalService.open(modal, { size: 'lg' });
  }

  // Créer un nouvel opérateur
  createOperateur() {
    if (this.newOperateurForm.invalid) return;

    const newOperateur = {
      ...this.newOperateurForm.value,
      etat_connexion: false
    };

    this.http.post(API_URL, newOperateur).subscribe(
      () => {
        this.modalService.dismissAll();
        this.loadOperateurs();
      },
      (error) => { console.error("Erreur lors de la création de l'opérateur", error); }
    );
  }

  // Supprimer un opérateur
  deleteOperateur(id: number, modal: TemplateRef<any>) {
    this.modalService.open(modal).result.then(
      (result) => {
        if (result === 'Ok') {
          this.http.delete(`${API_URL}/${id}`).subscribe(
            () => {
              this.toastr.success('Supprimé avec succès !', 'Succès');
              this.loadOperateurs();
            },
            (error) => { console.error("Erreur lors de la suppression de l'opérateur", error); }
          );
        }
      },
      () => {}
    );
  }

  updateOperateur() {
    if (this.editOperateurForm.invalid) return;

    const updatedOperateur = {
      ...this.editOperateurForm.value,
      motdepasse: this.editOperateurForm.value.motdepasse || undefined
    };

    this.http.put(`${API_URL}/${this.selectedOperateur.id}`, updatedOperateur).subscribe(
      () => {
        this.modalService.dismissAll();
        this.toastr.success('Mise à jour avec succès !', 'Succès');
        this.loadOperateurs();
      },
      (error) => { console.error("Erreur lors de la mise à jour de l'opérateur", error); }
    );
  }
}
