import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/ganymede/components/services/app.service';
import { DigitalArtsService } from 'src/app/main/digital-arts.service';
import { DigitalArt } from 'src/app/main/models/digital-art.model';

@Component({
  selector: 'app-digital-arts-details',
  templateUrl: './digital-arts-details.component.html',
  styleUrls: ['./digital-arts-details.component.scss']
})
export class DigitalArtsDetailsComponent implements OnInit {

  paramsSub: Subscription;
  nftId: string;
  art: DigitalArt;

  constructor(
    private app: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private digitalArtsService: DigitalArtsService,
  ) {
    this.paramsSub = this.route.params.subscribe(async params => {
      if (params.nftId) {
        if (this.nftId !== params.nftId) {
          this.nftId = params.nftId;
          if (this.app.store.digitalArtsData.digitalArts?.value?.[params.nftId]) {
            this.art = this.app.store.digitalArtsData.digitalArts.value[params.nftId];
            return;
          }
          this.art = null;
          const art = await this.digitalArtsService.fetchArtByTokenId(params.nftId);
          if (art) { this.art = art; }
        }
      }
    });
  }

  ngOnInit(): void {
  }

}
