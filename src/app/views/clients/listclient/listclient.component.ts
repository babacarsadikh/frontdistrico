import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';

@Component({
  selector: 'app-listclient',
  //standalone: true,
 // imports: [],
  templateUrl: './listclient.component.html',
  styleUrl: './listclient.component.scss'
})
export class ListclientComponent  implements OnInit {
  allSelected: boolean;
  page = 1;
  pageSize = 8;
  newClientForm: FormGroup;
  addAddressForm: FormGroup;
  selectedClient: any;
@ViewChild('newClientModal') newClientModal: any;
@ViewChild('addAddressModal') addAddressModal: any;

client ;
clientdetails;
addChantierForm: FormGroup;

testClient :any[]= [{"id_client":1,"nom_client":"Entreprise Alpha","adresses":[{"id_adresse":2,"adresse":"OUKAM"}]},{"id_client":2,"nom_client":"Alioune Niang","adresses":[{"id_adresse":3,"adresse":"DIAMNIADIO"}]}]
constructor(
        private dl: DataLayerService,
        private modalService: NgbModal,
        private toastr: ToastrService,
        private fb: FormBuilder
    ) {
      this.addChantierForm = this.fb.group({
    nom_chantier: ['', Validators.required],
    adresse: ['', Validators.required],
    ville: [''],
    code_postal: [''],
    notes: ['']
  });
      this.newClientForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: [''],
    entreprise: [''],
    telephone: [''],
    adresse: ['']
  });
      this.addAddressForm = this.fb.group({
        adresse: ['', Validators.required]
      });
     }

  ngOnInit() {

    this.loadClients();
}
openAddAddressModal(client: any) {
  this.selectedClient = client;
  this.loadClientschantier(client.id)
  this.modalService.open(this.addAddressModal, { centered: true });


}
openNewClientModal() {
    this.modalService.open(this.newClientModal, { centered: true });
  }
loadClients() {
  this.dl.getClients().subscribe(res => {
    console.log(res);
    this.client = res;
  });
}
loadClientschantier(clientId: number) {
  const client = this.client.find(c => c.id === clientId);

  this.dl.getClientsChantier(clientId).subscribe(res => {
    console.log(res);
    this.clientdetails = res;
  });
}
addChantier(clientId: number) {
  const chantier = {
    client_id: clientId,
    ...this.addChantierForm.value
  };

  this.dl.nouveauChantier(chantier).subscribe({
    next: res => {
      alert('Chantier ajouté');
      // Rafraîchir la liste des chantiers
      this.loadClientschantier(clientId);
      this.addChantierForm.reset();
      this.modalService.dismissAll();

    },
    error: err => {
      console.error('Erreur ajout chantier', err);
    }
  });
}

deleteChauffeur(){

}
createClient() {
  if (this.newClientForm.valid) {
    const newClientData = this.newClientForm.value;
   // console.log(newClientData)

    this.dl.addClient(newClientData).subscribe({
      next: (response) => {
        console.log('Client ajouté:', response);
        this.loadClients();
        this.modalService.dismissAll();
      },
      error: (error) => console.error('Erreur lors de l\'ajout:', error)
    });
  }
}
addAddress(clientId) {
  if (this.addAddressForm.valid) {
    const newAddress = this.addAddressForm.value.adresse;


    const client = this.client.find(c => c.id_client === clientId);
    if (client) {
      this.dl.AdressesChantier(newAddress).subscribe(res => {
        this.client = res['data'];
      });    }

}
}}
