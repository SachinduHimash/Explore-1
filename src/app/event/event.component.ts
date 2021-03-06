import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {MapsAPILoader} from '@agm/core';
import {UploadService} from '../services/upload.service';
import {AuthService} from '../services/auth.service';
import {UserService} from '../services/user.service';
import {EventsService} from '../services/events.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
// import {google} from '@agm/core/services/google-maps-types';
// import {} from 'googlemaps';
import * as _moment from 'moment';
import {DateFormatPipe} from '../services/date.pipe';
// tslint:disable-next-line:no-duplicate-imports
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PlatformLocation} from '@angular/common';
import {GroupService} from '../services/group.service';

const moment = _moment;

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})

export class EventComponent implements OnInit {
  name;
  description;
  startdate;
  enddate;
  starttime;
  eventcreatedby;
  eventid;
  enteraddress;
  startd;
  isexists = false;
  eid;
  gid;
  admin;
  isInvalid;
  isLoaded;
  modalRef;
  closeResult;
  groupname = this.gid;
  isfirst = true;
  // displayName;
  // userName;
  userid;
  ad;
  // postService;
  date = new Date();

  inputFile;
  filename = 'Add New Event Photo';
  uid;
  photoURL = '../../assets/images/default-profile.jpg';


  latitude: number;
  longitude: number;
  zoom: number;
  address = '';
  eventForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(30)
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(5)
    ]),
    groupname: new FormControl('', [
      Validators.required,
      Validators.minLength(5)
    ]),
    startdate: new FormControl('', [
      Validators.required

    ]),
    enteraddress: new FormControl('', [
      Validators.required

    ]),

    enddate: new FormControl('', [
      Validators.minLength(5),
    ]),
    starttime: new FormControl('', [
      Validators.required
    ]),
    startd: new FormControl('', [
      Validators.required
    ])
  });
  @ViewChild('search', {static: false})
  public searchElementRef: ElementRef;
  events = [];
  private geoCoder;

  constructor(
    private datePipe: DateFormatPipe,
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private userService: UserService,
    private auth: AuthService,
    private modalService: NgbModal,
    private location: PlatformLocation,
    private groupservice: GroupService,
    private mapsAPILoader: MapsAPILoader,
    private router: Router,
    private ngZone: NgZone,
    private uploadService: UploadService) {
    location.onPopState((event) => {
      // ensure that modal is opened
      if (this.modalRef !== undefined) {
        this.modalRef.close();
      }
    });
  }

  get Name() {
    return this.eventForm.get('name');
  }


  // openDialog(): void {
  //   const dialogRef = MatDialog.open(DialogOverviewExampleDialog, {
  //     width: '250px',
  //     data: {name: this.name, animal: this.animal}
  //   });
  //   console.log('The dialog was closed');

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed');
  //     this.animal = result;
  //   });
  // }

  get Description() {
    return this.eventForm.get('description');

  }

  get Location() {
    return this.eventForm.get('enteraddress');
  }

  get StartDate() {
    return this.eventForm.get('startdate');
  }

  get EndDate() {
    return this.eventForm.get('enddate');
  }

  get StartTime() {
    return this.eventForm.get('starttime');
  }

  openDialog() {
    console.log('The dialog was closed');
  }

  ngOnInit() {
    this.route.params.subscribe(
      routeurl => {
        this.eid = routeurl.eid;
      });
    var gid = localStorage.getItem('gid');
    if (gid) {
      this.groupservice.getGroup(gid).subscribe(group => {
        if (group) {
          this.groupname = group.gname;
        }
      });
    }
    console.log('this is router eid' + this.eid);
    if (this.eid != null) {
      console.log('true');
      this.eid = localStorage.getItem('eid');
      console.log('this is real eid' + this.eid);
      this.auth.getAuthState().subscribe(currUser => {
        if (currUser) {
          this.uid = currUser.uid;
          this.eventsService.getEvent(this.eid).subscribe(
            eventdoc => {
              if (eventdoc) {
                this.photoURL = eventdoc.photoURL ? eventdoc.photoURL : this.photoURL;
                this.latitude = eventdoc.latitude;
                this.longitude = eventdoc.longitude;
                this.enteraddress = eventdoc.address;
                this.ad = this.enteraddress;
                console.log('this is enter address in sid doc' + this.enteraddress);
                this.name = eventdoc.name;
                this.admin = eventdoc.admin ? eventdoc.admin : null;
                this.gid = eventdoc.gid ? eventdoc.gid : null;
                this.description = eventdoc.description;
                this.startdate = eventdoc.startdate;
                console.log('start date value' + this.startdate);
                this.enddate = eventdoc.enddate;
                this.starttime = eventdoc.starttime;
                this.startd = this.startdate;
                this.isexists = true;
                this.startdate = this.datePipe.transform(this.startdate.toDate(), 'date-picker-full');
                this.enddate = this.datePipe.transform(this.enddate.toDate(), 'date-picker-full');
                // var day=this.datePipe.transform(this.startd.toDate(),'date-picker-day');
                // var month=this.datePipe.transform(this.startd.toDate(),'date-picker-month');
                // var year=this.datePipe.transform(this.startd.toDate(),'date-picker-year');
                // this.startd= new FormControl(moment[this.startdate.toDate().getFullYear(),this.startdate.toDate().getMonth(),this.startdate.toDate().getDate()]);


              } else {
                console.log('invalid');
                this.isInvalid = true;
                this.isLoaded = true;
              }
              this.groupname = this.gid;
            }
          );
          // this.userService.getus
        }
        this.mapsAPILoader.load().then(() => {
          this.setCurrentLocation();
          this.geoCoder = new google.maps.Geocoder;

          let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
            types: ['address']
          });
          autocomplete.addListener('place_changed', () => {
            this.ngZone.run(() => {
              //get the place result
              let place: google.maps.places.PlaceResult = autocomplete.getPlace();
              console.log('place when listning' + place);
              // console.log("place"+place.geometry.location);

              //verify result
              if (place.geometry === undefined || place.geometry === null) {
                return;
              }

              //set latitude, longitude and zoom
              this.latitude = place.geometry.location.lat();
              this.longitude = place.geometry.location.lng();
              this.getAddress(this.latitude, this.longitude);
              this.zoom = 12;
            });
          });
        });
      });


    } else {
      console.log('false');
      this.auth.getAuthState().subscribe(currUser => {
        if (currUser) {
          this.uid = currUser.uid;
        }
      });
      this.mapsAPILoader.load().then(() => {
        this.setCurrentLocation();
        this.geoCoder = new google.maps.Geocoder;

        let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
          types: ['address']
        });
        autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            //get the place result
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();
            console.log('place when listning' + place);
            // console.log("place"+place.geometry.location);

            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }

            //set latitude, longitude and zoom
            this.latitude = place.geometry.location.lat();
            this.longitude = place.geometry.location.lng();
            this.getAddress(this.latitude, this.longitude);
            this.zoom = 12;
          });
        });
      });
    }
    this.getAllEvents();


  }


  // markerDragEnd($event: MouseEvent) {
  //   console.log($event);
  //   this.latitude = $event.coords.lat;
  //   this.longitude = $event.coords.lng;
  //   this.getAddress(this.latitude, this.longitude);
  // }

  tomorrow() {
    var tomorrow = new Date();
    tomorrow.setDate(this.date.getDate() + 1);
    return tomorrow = tomorrow;
  }

  getAllEvents() {
    this.eventsService.getEventList().subscribe(
      userEvents => {

        this.events = [];
        userEvents.forEach((eventData: any) => {

          this.events.push(eventData);

        });
      }
    );
  }

  open(content, type?) {
    console.log('events');
    this.modalRef = this.modalService.open(content, {
      size: 'sm',
      windowClass: 'modal-style'
    });
    this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason, type)}`;
    });
  }

  eventDeatils(eid) {
    this.router.navigateByUrl('groupevent/' + eid);
    localStorage.setItem('geid', eid);

  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({'location': {lat: latitude, lng: longitude}}, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          if (this.address = '') {
            this.address = '';
          } else {

            this.address = results[0].formatted_address;
            if (this.isfirst && !this.enteraddress) {
              this.enteraddress = this.address;
              console.log('entered new address' + this.enteraddress);
              this.isfirst = false;
            }

          }

        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  getLatLngByAddress(loc) {
    this.geoCoder.geocode({'address': loc}, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.latitude = results[0].geometry.location.latitude;
          this.longitude = results[0].geometry.location.longitude;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  saveEvent() {
    console.log('event saving');
    if (!this.Name.errors && !this.Description.errors && !this.Location.errors && !this.StartDate.errors && !this.StartTime.errors) {
      console.log('this is enter address ddddd' + this.ad);
      this.getLatLngByAddress(this.enteraddress ? this.enteraddress : this.ad);
      const data = {
        admin: this.uid,
        latitude: this.latitude,
        longitude: this.longitude,
        address: this.enteraddress ? this.enteraddress : this.ad,
        name: this.name,
        gid: this.groupname,
        description: this.description,
        startdate: this.startdate,
        enddate: this.enddate,
        starttime: this.starttime,
        photoURL: 'https://xplore-1.firebaseapp.com/assets/images/default-profile.jpg'
      };
      this.eventsService.createEvent(data);
    }


  }

  updateEvent() {
    console.log('this is update event' + this.enteraddress);
    if (!this.Name.errors && !this.Description.errors && !this.Location.errors && !this.StartDate.errors && !this.StartTime.errors) {
      console.log('this is enter address ddddd' + this.ad ? this.ad : this.enteraddress);
      this.getLatLngByAddress(this.enteraddress ? this.enteraddress : this.ad);
      const data = {
        admin: this.admin,
        latitude: this.latitude,
        longitude: this.longitude,
        address: this.enteraddress ? this.enteraddress : this.ad,
        name: this.name,
        eid: this.eid,
        gid: this.groupname,
        description: this.description,
        startdate: this.startdate,
        enddate: this.enddate,
        starttime: this.starttime

      };
      this.eventsService.updateEventData(data);
    }

  }

  processImage(event) {
    this.inputFile = event.target.files[0];
    this.filename = this.inputFile.name;
    if (this.inputFile.size > 2000000) {
      this.filename = 'Max Filesize 2Mb!';
    } else {
      if (this.filename.length > 25) {
        this.filename = this.filename.slice(0, 10) + '...' + this.filename.slice(this.filename.length - 3);
      }
      console.log('pid is the ' + this.eid);
      this.uploadService.pushUpload(this.inputFile, 'event', this.eid);
    }
  }

  private getDismissReason(reason: any, type?): string {
    if (type === 'grouplist') {
      history.back();
    }
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }


}


// @Component({
//   selector: 'dialog-overview-example-dialog',
//   templateUrl: 'dialog-overview-example-dialog.html',
// })

// export class DialogOverviewExampleDialog {

//   constructor(
//     public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
//     @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

//   onNoClick(): void {
//     this.dialogRef.close();
//   }

// }
