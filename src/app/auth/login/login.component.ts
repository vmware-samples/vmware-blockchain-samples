/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'vmw-sc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('username') usernameEl: ElementRef;
  error: boolean;

  loginForm: FormGroup = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
  });

  logginIn: boolean;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.usernameEl.nativeElement.focus();
  }

  onSubmit() {
    this.logginIn = true;
    this.authService
      .loginLocally(this.loginForm.get('username').value, this.loginForm.get('password').value)
      .subscribe(response => {
        console.log(response);
        this.logginIn = false;
        this.router.navigate(['/home']);
    }, error => {
      this.logginIn = false;
      this.error = true;
    });
  }
}
