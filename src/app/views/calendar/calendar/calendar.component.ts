import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';


import { CalendarAppService } from '../calendar-app.service';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { FormBuilder } from '@angular/forms';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-calendar',
	templateUrl: './calendar.component.html',
	styleUrls: ['./calendar.component.scss'],
	animations: [SharedAnimations]
})
export class CalendarComponent implements OnInit {
	public view = 'month';
	public viewDate = new Date();
	@ViewChild('eventDeleteConfirm', { static: true }) eventDeleteConfirm;


	constructor(
		private modalService: NgbModal,
		private calendarService: CalendarAppService,
        private dl: DataLayerService,
        private toastr: ToastrService,
        private fb: FormBuilder
	) {

	}
formules: any[] = [];
newFormule: any = { nom: '', description: '', prix_metre_cube: 0, actif: true };

openFormuleModal(modal: any) {
  this.newFormule = { nom: '', description: '', prix_metre_cube: 0, actif: true };
    this.modalService.open(modal, { size: 'lg', centered: true });

}
	ngOnInit() {
    this.loadformules()
	}
onSaveFormule(modal: any, form: any) {
  if (form.valid) {
    this.dl.ajouterformule(this.newFormule).subscribe(res => {
      console.log (res)
      this.loadformules()
      modal.close();
    });
  } else {
    form.control.markAllAsTouched();
  }
}
loadformules(){
     this.dl.getFormule()
        .subscribe(res => {
            this.formules=res

        });
}
deleteFormule(id: number) {

}

}
