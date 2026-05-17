import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IMenuItem {
  id?: string;
  title?: string;
  description?: string;
  type: string;       // link/dropDown/extLink
  name?: string;      // Display text
  state?: string;     // Router state
  icon?: string;      // Material icon name
  tooltip?: string;
  disabled?: boolean;
  sub?: IChildItem[];
  badges?: IBadge[];
  active?: boolean;
}

export interface IChildItem {
  id?: string;
  parentId?: string;
  type?: string;
  name: string;
  state?: string;
  icon?: string;
  sub?: IChildItem[];
  active?: boolean;
}

interface IBadge {
  color: string;
  value: string;
}

interface ISidebarState {
  sidenavOpen?: boolean;
  childnavOpen?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  public sidebarState: ISidebarState = {
    sidenavOpen: true,
    childnavOpen: false
  };

  selectedItem: IMenuItem;

  constructor() {
    this.loadMenuByRole();
  }

  // ✅ Menu pour les admins
  private adminMenu: IMenuItem[] = [
    {
      name: 'TABLEAU DE BORD',
      type: 'link',
      icon: 'i-Bar-Chart',
      state: '/dashboard/v2'
    },
    {
      name: 'BON DE LIVRAISON',
      type: 'link',
      icon: 'i-Receipt-3',
      state: '/bonlivraison'
    },
    {
      name: 'BON DE COMMANDE',
      type: 'link',
      icon: 'i-File-Clipboard-File--Text',
      state: '/invoice'
    },
    {
      name: 'CHAUFFEURS',
      type: 'link',
      icon: 'i-Jeep',
      state: '/chauffeur'
    },
    {
      name: 'CLIENTS',
      type: 'link',
      icon: 'i-Business-ManWoman',
      state: '/client'
    },
    {
      name: 'PARAMÈTRES',
      type: 'dropDown',
      icon: 'i-Gear',
      sub: [
        { icon: 'i-Engineering', name: 'Opérateurs', state: '/operateur', type: 'link' },
        { icon: 'i-Gear', name: 'Formule', state: '/calendar', type: 'link' },
      ]
    },
  ];

  // ✅ Menu pour les opérateurs
  private operateurMenu: IMenuItem[] = [
    {
      name: 'TABLEAU DE BORD',
      type: 'link',
      icon: 'i-Bar-Chart',
      state: '/dashboard/v2'
    },
    {
      name: 'BON DE LIVRAISON',
      type: 'link',
      icon: 'i-Receipt-3',
      state: '/bonlivraison'
    },

    {
      name: 'BON DE COMMANDE',
      type: 'link',
      icon: 'i-File-Clipboard-File--Text',
      state: '/invoice'
    },
    {
      name: 'CHAUFFEURS',
      type: 'link',
      icon: 'i-Jeep',
      state: '/chauffeur'
    },
      {
      name: 'CLIENTS',
      type: 'link',
      icon: 'i-Business-ManWoman',
      state: '/client'
    },
     {
      name: 'FORMULATIONS',
      type: 'link',
      icon: 'i-Gear',
      state: '/calendar'

    },
  ];

  // BehaviorSubject pour suivre le menu courant
  menuItems = new BehaviorSubject<IMenuItem[]>([]);
  menuItems$ = this.menuItems.asObservable();

  // ✅ Détermine quel menu charger selon le rôle
  private loadMenuByRole() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const role = (user.role || '').toLowerCase();

        if (role === 'admin') {
          this.menuItems.next(this.adminMenu);
        } else if (role === 'operateur') {
          this.menuItems.next(this.operateurMenu);
        } else {
          // Par défaut, menu minimal
          this.menuItems.next([
            {
              name: 'TABLEAU DE BORD',
              type: 'link',
              icon: 'i-Bar-Chart',
              state: '/dashboard/v2'
            }
          ]);
        }
      } else {
        // Si aucun user n’est trouvé
        this.menuItems.next([]);
      }
    } catch (e) {
      console.error('Erreur lors du chargement du menu par rôle :', e);
      this.menuItems.next([]);
    }
  }
  get defaultMenu(): IMenuItem[] {
  return this.menuItems.getValue();
}

}
