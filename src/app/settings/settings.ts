import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.html',
  //styleUrl: './settings.css'
})
export class Settings {

  currentLogo = 'assets/images/img2.png';

  businessName = 'Raigon Arts';

  businessPhone = '+91 8921348433';

  businessEmail = 'orders@raigonarts.com';

  workshopAddress =
    'Main Workshop, MG Road, Overbridge Junction, Trivandrum, Kerala - 695001';


  saveSettings(): void {

    console.log('Shop settings saved successfully!');

  }


  resetLogo(): void {

    this.currentLogo = 'assets/images/img2.png';

  }


  handleLogoUpload(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {

      console.error(
        'Please select a valid image file.'
      );

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      this.currentLogo =
        reader.result as string;

    };

    reader.readAsDataURL(file);

  }

}
