//if modified, update rx store in digital-arts.service.ts
export interface DigitalArt {
  tokId: string;
  title: string;
  image: string;
  artistName: string;
  ownerHistory?: string[];
  effectiveImageUrl?: string;
}