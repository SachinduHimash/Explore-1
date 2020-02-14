import { DomSanitizer, Title } from '@angular/platform-browser';
import { UploadService } from './../services/upload.service';
import { CreateGroupComponent } from './../create-group/create-group.component';
import { AuthService } from './../services/auth.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PostsService } from '../services/posts.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupService } from '../services/group.service';
import { DateFormatPipe } from '../services/date.pipe';
import { NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { PlatformLocation } from '@angular/common';
import {EventsService} from '../services/events.service';

@Component({
  selector: 'app-group-event',
  templateUrl: './group-event.component.html',
  styleUrls: ['./group-event.component.css']
})
export class GroupEventComponent implements OnInit {

  @ViewChild('addmembers', { static: false}) modalContent: ElementRef;


  eid;
  name;
  description;
  totalMembers;
  totalPosts;
  createDate;
  members;
  admin;
  photoURL = '../../assets/images/default-profile.jpg';
  latitude;
  longitude;
  gid;
  startdate;
  enddate;
  starttime;
  address;
  gname;

  isInvalid;
  isSubbed = false;
  isLoggedin;
  isLoaded = false;
  isAdmin = false;

  posts;
  modalRef;
  closeResult;

  filename;

  constructor(

    private afs: AngularFirestore,
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private eventservice:EventsService,
    private datePipe: DateFormatPipe,
    private modalService: NgbModal,
    private location: PlatformLocation,
    private uploadService: UploadService,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private groupservice:GroupService
  ) {
    location.onPopState((event) => {
      // ensure that modal is opened
      if (this.modalRef !== undefined) {
        this.modalRef.close();
      }
    });
  }

  ngOnInit() {
    console.log(localStorage.getItem("geid"));
    this.route.params.subscribe(
      routeurl => {
        this.eid = routeurl.geid;
        this.eventservice.getEvent(this.eid).subscribe(
          eventDoc => {
            if (eventDoc) {
              this.name = eventDoc.name;
              this.description = eventDoc.description;
              this.createDate = eventDoc.createDate;
              this.admin = eventDoc.admin ? eventDoc.admin : null;
              this.isLoaded = true;
              this.latitude=eventDoc.latitude;
              this.longitude=eventDoc.longitude;
              this.startdate=eventDoc.startdate;
              this.enddate=eventDoc.enddate;
              this.starttime=eventDoc.starttime;
              this.gid=eventDoc.gid;
              this.photoURL = eventDoc.photoURL ? eventDoc.photoURL : this.photoURL;
              this.address=eventDoc.address;
              this.titleService.setTitle(this.name + ' | ' + this.description);
              this.checkAdmin();
            } else {
              console.log('invalid');
              this.isInvalid = true;
              this.isLoaded = true;
            }
          });
        this.eventservice.getFeed(this.eid).subscribe(
          feed => {
            this.posts = feed;
          });
        this.eventservice.getMembers(this.eid).subscribe(
          memberList => {
            this.members = memberList;
          });
        this.checkSub();
        this.checkLogin();
      });
  }

  getStyle() {
    if (this.photoURL) {
      return this.sanitizer.bypassSecurityTrustStyle(`background-image: url(${this.photoURL})`);
    }
  }

  checkLogin() {
    this.auth.getAuthState().subscribe(user => {
      if (user) {
        this.isLoggedin = true;
      } else {
        this.isLoggedin = false;
      }
    });
  }

  checkAdmin() {
    this.auth.getAuthState().subscribe(curruser => {
      if (curruser) {
        if (this.admin === curruser.uid) {
          this.isAdmin = true;
        } else {
          this.isAdmin = false;
        }
      }
    });
  }

  checkSub() {
    this.auth.getAuthState().subscribe(currentuser => {
      if (currentuser) {
        this.afs.doc('events/' + this.eid + '/members/' + currentuser.uid)
          .valueChanges()
          .subscribe(user => {
            if (user) {
              this.isSubbed = true;
            } else {
              this.isSubbed = false;
            }
          });
      }
    });
  }

  subscribe() {
    this.eventservice.subscribe(this.eid);
  }

  unsubscribe() {
    this.eventservice.unsubscribe(this.eid);
    this.checkSub();
  }
  getgroup(){
    return this.groupservice.getGroup(this.gid).subscribe(group=>{
      if(group){
        this.gname=group.gname;
      }

    });
  }

  getDate() {
    return this.datePipe.transform(this.createDate.toDate(), 'month');
  }
  getStartingDate() {
    return this.datePipe.transform(this.startdate.toDate(), 'month');
  }
  getEndDate() {
    return this.datePipe.transform(this.enddate.toDate(), 'month');
  }
  open(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  sendTo(){
    this.router.navigateByUrl('event/'+this.eid);
    localStorage.setItem("eid",this.eid);
  }

  see(){
    this.modalRef = this.modalService.open(this.modalContent, {
      size: 'lg',
      windowClass: 'modal-style'
    });
    this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  processImage(event) {
    const file = event.target.files[0];
    if (file.size > 2000000) {
      this.filename = 'Max Filesize 2Mb!';
    } else {
      this.filename = 'Edit Banner';
      this.uploadService.pushUpload(file, 'event', this.eid);
    }
  }

  addMembers(){
    this.see();
  }
}