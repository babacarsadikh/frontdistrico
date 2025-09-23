import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../../../services/navigation.service';
import { SearchService } from '../../../../services/search.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-header-sidebar-large',
  templateUrl: './header-sidebar-large.component.html',
  styleUrls: ['./header-sidebar-large.component.scss']
})
export class HeaderSidebarLargeComponent implements OnInit {

    notifications: any[];

    constructor(
      private navService: NavigationService,
      public searchService: SearchService,
      private auth: AuthService
    ) {
      this.notifications = [];
    }

    ngOnInit() {
    }

    toggelSidebar() {
      const state = this.navService.sidebarState;
      if (state.childnavOpen && state.sidenavOpen) {
        return state.childnavOpen = false;
      }
      if (!state.childnavOpen && state.sidenavOpen) {
        return state.sidenavOpen = false;
      }
      // item has child items
      if (!state.sidenavOpen && !state.childnavOpen
        && this.navService.selectedItem.type === 'dropDown') {
          state.sidenavOpen = true;
          setTimeout(() => {
              state.childnavOpen = true;
          }, 50);
      }
      // item has no child items
      if (!state.sidenavOpen && !state.childnavOpen) {
        state.sidenavOpen = true;
      }
    }

    signout() {
      this.auth.signout();
    }

}
