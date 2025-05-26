import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Hotel {
  id: number;
  name: string;
  address: string;
  rating: number;
  imageUrl: string;
  description: string;
}

@Component({
  selector: 'app-hotels', // Update the selector if you want
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.scss']
})
export class HotelsComponent implements OnInit { // Rename the class
  hotels: Hotel[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Placeholder hotel data
    this.hotels = [
      { id: 1, name: 'ITC Narmada', address: '123 Main St, Ahmedabad', rating: 4.9, 
        imageUrl: 'https://curlytales.com/wp-content/uploads/2022/08/Untitled-design-2022-08-22T164609.654.jpg', description: '...' },
      { id: 2, name: 'Redisson Blue', address: 'Law Garden, Ahmedabad', rating: 4.8, 
        imageUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/77/46/23/welcomhotel-by-itc-hotels.jpg?w=1400&h=800&s=1', description: '...' },
      { id: 3, name: 'Taj Vivanta', address: 'Akota, Vadodara', rating: 4.5, 
        imageUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.hospitalitynet.org%2Fpicture%2Fxxl_153145327.jpg%3Ft%3D1661166987&f=1&nofb=1&ipt=8b021b089db3f1311653c70a028c68e063b8711b7b34c341eda0da2a7ef09ed2', description: '...' },
      { id: 4, name: 'Hyatt Regency', address: 'Ashram Road, Ahmedabad', rating: 4.7,
        imageUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdynamic-media-cdn.tripadvisor.com%2Fmedia%2Fphoto-o%2F17%2F70%2F7b%2Fd5%2Fexterior.jpg%3Fw%3D900%26h%3D-1%26s%3D1&f=1&nofb=1&ipt=363a73f81dbc3ea6fcffbefd2e255591d38fad6e6d2acbc457935ff45e5419cd', description: '...' },
      { id: 5, name: 'Countryard Marriot', address: 'RiverFront, Ahmedabad', rating: 4.5, 
        imageUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fspecialplacesofindia.com%2Fwp-content%2Fuploads%2F2024%2F02%2FR-2024-02-02T113709.052.jpg&f=1&nofb=1&ipt=2b5e33ac3e1c5f486fc2ae496c44bd5c3c0383470f387271a10d8ae2589ee782', description: '...' },
      // ... more hotels
    ];
  }

  viewAvailability(hotelId: number) {
    this.router.navigate(['/user/hotel', hotelId, 'booking']);
  }
}