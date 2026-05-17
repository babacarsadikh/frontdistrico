import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';

import { Country } from '../../../shared/models/country.model';
import { CountryService } from '../../../shared/services/country.service';
import { NgbdSortableHeader, SortEvent } from '../../../shared/directives/sortable.directive';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NgbHighlight, NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
import { ToastrService } from 'ngx-toastr';




@Component({
  selector: 'app-listchauffeur',
  standalone: false,
  templateUrl: './listchauffeur.component.html',
  styleUrl: './listchauffeur.component.scss',
  providers: [CountryService, DecimalPipe],

})
export class ListchauffeurComponent {
  chauffeurForm: FormGroup;
  camionForm!: FormGroup;

  allSelected: boolean;
  page = 1;
  pageSize = 8;
  confirmResut;
  chauffeurs: any=[];


camions: any[] = [];
  countries$: Observable<Country[]>;
  total$: Observable<number>;
  chauffeur = {
   nom: '',
  prenom: '',
  telephone: '',
  camion_id: null
  };

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(

    public service: CountryService,
    private dl: DataLayerService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
     this.camionForm = this.fb.group({
      plaque_immatriculation: ['', Validators.required],
      modele: ['', Validators.required],
      capacite: [null, [Validators.required, Validators.min(1)]],
      date_mise_en_service: [null],
      etat: ['disponible', Validators.required]
    });

  }
  ngOnInit() {
     // Charger la liste des camions pour le select
   this.loadcamions();
    this.loadChauffeurs();


}
saveitfist (valeur){
  this.dl.ajouterchauffeur(valeur)
      .subscribe(res => {
          console.log(res)
      })
}
// onSaveChauffeur(modal: any): void {

//   if (this.chauffeur) {
//     this.saveitfist (this.chauffeur)
//     this.loadChauffeurs();
//      modal.close();
//   } else {
//     console.error('Formulaire invalide');
//   }
// }
// onSaveChauffeur(modal: any): void {
//   if (this.chauffeur && this.chauffeur.nom_chauffeur && this.chauffeur.telephone && this.chauffeur.plaque_camion) {
//     try {
//       this.saveitfist(this.chauffeur);
//       this.loadChauffeurs();
//       modal.close();
//     } catch (error) {
//     // console.error('Erreur lors de l’enregistrement du chauffeur :', error);
//       this.toastr.error('veuillez remplir tous les champs.', 'Erreur');

//     }
//   } else {
//    // console.error('Formulaire invalide : veuillez remplir tous les champs.');
//     this.toastr.error('veuillez remplir tous les champs.', 'Erreur');

//   }
// }
onSaveChauffeur(modal: any, form: any) {
  if (form.valid) {
    this.dl.ajouterchauffeur(this.chauffeur).subscribe({
      next: res => {
        console.log('Chauffeur ajouté', res);
            this.loadChauffeurs();

        modal.close();
      },
      error: err => {
        console.error('Erreur ajout chauffeur', err);
      }
    });
  } else {
    form.control.markAllAsTouched();
  }
}
ajouterCamion() {
    if (this.camionForm.valid) {
      this.dl.ajoutercamion(this.camionForm.value).subscribe({
        next: res => {
          alert('Camion ajouté avec succès');
          this.loadcamions();
        },
        error: err => {
          console.error('Erreur lors de l’ajout du camion', err);
        }
      });
    } else {
      alert('Formulaire invalide');
    }
  }

  loadcamions (){
    this.dl.getCamions().subscribe(res => {
    this.camions = res;
  });
  }
  loadChauffeurs() {
    this.dl.getAllchauffeur()
        .subscribe(res => {
            this.chauffeurs=res
           console.log('-->',this.chauffeurs)

        });
}
  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }
  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' })
    .result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log('Err!', reason);
    });
  }
  openSmall(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'sm' })
    .result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log('Err!', reason);
    });
  }

  confirm(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', centered: true })
    .result.then((result) => {
      this.confirmResut = `Closed with: ${result}`;
    }, (reason) => {
      this.confirmResut = `Dismissed with: ${reason}`;
    });
  }
}

