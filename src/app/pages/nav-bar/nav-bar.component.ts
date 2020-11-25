import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  state = true;
  id: string;
  type: string;
  options: Array<any>;
  userId: string;

  constructor(private router: Router) {
    this.initializeOptions();
  }

  ngOnInit(): void {
    this.change();
    // console.log('here');
  }

  initializeOptions(): void {
    this.options = [];
    this.options.push({text: 'Home', icon: 'home'});
    this.options.push({text: 'Profile', icon: 'perm_identity'});
    this.options.push({text: 'Contracts', icon: 'book'});
    this.options.push({text: 'Requests', icon: 'receipt'});
    // console.log(this.options);
    this.options.push({text: 'Subscription', icon: 'monetization_on'});
  }

  change(): void {
    this.id = localStorage.getItem('id');
    this.userId = localStorage.getItem('userId');
    this.type = localStorage.getItem('type');
  }

  changeNull(): void {
    this.router.navigate(['home']).then(() => {
      localStorage.setItem('id', '');
      localStorage.setItem('userId', '');
      localStorage.setItem('type', null);
    });
  }

  redirectOption(option): void {
    this.change();
    // console.log(option);
    if (option.text === 'Home') {
      this.router.navigate(['home']).then(() => null);
    } else if (option.text === 'Profile') {
      if (this.type === 'student') {
        this.router.navigate([`users/${this.userId}/students/${this.id}`]).then(() => null);
      } else {
        this.router.navigate([`users/${this.userId}/landlords/${this.id}`]).then(() => null);
      }
    } else if (option.text === 'Contracts') {
      if (this.type === 'student') {
        this.router.navigate([`students/${this.id}/contracts`]).then(() => null);
      } else {
        this.router.navigate([`landlords/${this.id}/contracts`]).then(() => null);
      }
    } else if (option.text === 'Requests') {
      if (this.type === 'student') {
        this.router.navigate([`students/${this.id}/requests`]).then(() => null);
      } else {
        this.router.navigate([`landlords/${this.id}/requests`]).then(() => null);
      }
    } else if (option.text === 'Subscription') {
      this.router.navigate([`landlords/${this.id}/subscription`]).then(() => null);
    }
  }

  goToHome(): void {
    this.router.navigate(['home']).then(() => null);
  }

}
