import { Component, OnInit } from '@angular/core';
import { DataLayerService } from '../../shared/services/data-layer.service';

@Component({ selector: 'app-rapports', templateUrl: './rapports.component.html', styleUrls: ['./rapports.component.scss'] })
export class RapportsComponent implements OnInit {
  filters: any = {};
  report: any;
  history: any[] = [];
  loading = false;
  error = '';
  generating = false;
  clients: any[] = []; chantiers: any[] = []; chauffeurs: any[] = []; commandes: any[] = [];

  constructor(private data: DataLayerService) {}
  ngOnInit(): void {
    this.selectPeriod('today'); this.loadHistory();
    this.data.getClients().subscribe((v: any) => this.clients = v.clients || v || []);
    this.data.getChantiers().subscribe((v: any) => this.chantiers = v.chantiers || v || []);
    this.data.getAllchauffeur().subscribe((v: any) => this.chauffeurs = v.chauffeurs || v || []);
    this.data.getCommandes().subscribe((v: any) => this.commandes = v.commandes || v || []);
  }
  loadHistory(): void { this.data.getReports().subscribe({ next: v => this.history = v.rapports || [], error: () => this.history = [] }); }
  selectPeriod(period: string): void {
    const end = new Date(); const start = new Date(end);
    if (period === 'yesterday') { start.setDate(start.getDate() - 1); end.setDate(end.getDate() - 1); }
    if (period === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    if (period === 'month') start.setDate(1);
    this.filters.date_debut = this.formatDate(start); this.filters.date_fin = this.formatDate(end); this.loadPreview();
  }
  loadPreview(): void {
    this.loading = true; this.error = '';
    this.data.previewReport(this.filters).subscribe({
      next: v => { this.report = v; this.loading = false; },
      error: () => { this.error = 'Impossible de charger le rapport.'; this.loading = false; }
    });
  }
  generate(): void {
    this.generating = true; this.error = '';
    this.data.generateReport(this.filters).subscribe({ next: item => { this.generating = false; this.loadHistory(); this.download(item.id, 'pdf'); }, error: () => { this.generating = false; this.error = 'La génération a échoué.'; } });
  }
  regenerate(item: any): void {
    this.data.regenerateReport(item.id).subscribe({ next: () => this.loadHistory(), error: () => this.error = 'La régénération a échoué.' });
  }
  download(id: number, format: 'pdf'|'excel'): void {
    this.data.downloadReport(id, format).subscribe(blob => { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `rapport.${format === 'pdf' ? 'pdf' : 'xlsx'}`; anchor.click(); URL.revokeObjectURL(url); });
  }
  private formatDate(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
}
