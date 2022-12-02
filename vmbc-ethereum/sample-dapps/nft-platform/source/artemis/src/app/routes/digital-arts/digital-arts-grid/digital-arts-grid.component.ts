import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DigitalArt } from 'src/app/main/models/digital-art.model';

@Component({
  selector: 'app-digital-arts-grid',
  templateUrl: './digital-arts-grid.component.html',
  styleUrls: ['./digital-arts-grid.component.scss']
})
export class DigitalArtsGridComponent implements OnInit {

  @Input() arts: DigitalArt[] = [];

  constructor(
    private router: Router,
  ) {}

  ngOnInit() {}

  goToArt(art: DigitalArt) {
    this.router.navigate([`/digital-arts/${art.tokId}`]);
  }

}
