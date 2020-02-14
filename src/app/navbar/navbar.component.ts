import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
    private notif: NotificationService,
    private modalService: NgbModal,
    private msgService: MessageService
  ) { }

  @ViewChild('popover', { static: false }) popoverRef;

  isUser: boolean;
  displayName;
  uid;
  userName;
  photoURL = '../../assets/images/default-profile.jpg';
  totalFollowers;
  totalFollowing;
  totalScribes;

  unread;
  unreadmsgs;
  notifs;
  notifcomment;
  notiflikes;
  notifgroup;
  notifevent;

  closeResult;
  modalRef;

  ngOnInit() {
    this.isUser = false;
    this.getUserData();
  }
  sendTo(path) {
    if (path === 'profile') {
      this.router.navigateByUrl('user/' + this.userName);
    }
    if (path === 'home') {
      this.router.navigateByUrl('home');
    }
    if (path === 'account') {
      this.router.navigateByUrl('account');
    }
    if (path === 'messages') {
      this.router.navigateByUrl('messaging');
    }
    if (path === 'groups') {
      this.router.navigateByUrl('user/' + this.userName + '/groups');
    }
  }
  getUserData() {
    this.auth.getAuthState().subscribe(
      user => {
        if (user) {
          this.isUser = true;
          this.userService.retrieveUserDocument(user.uid).subscribe(
            userDoc => {
              if (userDoc) {
                this.displayName = userDoc.displayName;
                this.userName = userDoc.userName;
                this.photoURL = userDoc.photoURL;
                this.totalFollowing = userDoc.totalFollowing;
                this.totalFollowers = userDoc.totalFollowers;
                this.totalScribes = userDoc.totalScribes;
                this.uid = userDoc.uid;
                // this.msgService.getUnread(userDoc.uid).subscribe(unreadmsgs => this.unreadmsgs = unreadmsgs);
                // this.notif.getUserUnread(userDoc.uid).subscribe(notifs => this.unread = notifs);
                // this.notif.getNotifs(userDoc.uid).subscribe(notifs => this.notifs = notifs);
                this.notif.getNotifComment(userDoc.uid).subscribe(notifs =>{
                  if(notifs)
                  this.notifcomment = notifs;
                } );
                this.notif.getNotifLike(userDoc.uid).subscribe(notifs => {
                  if(notifs)
                  this.notiflikes = notifs;

                });
                this.notif.getNotifGroup(userDoc.uid).subscribe(notifs => {
                  if(notifs)
                  this.notifgroup = notifs;
                });
                this.notif.getNotifEvent(userDoc.uid).subscribe(notifs => {
                  if(notifs)
                  this.notifevent = notifs;
                });


              }
            });
        } else {
          this.isUser = false;
        }
      });
  }

  clearNotif() {
    if (this.unread && this.unread.length > 0) {
      this.notif.clearUnread(this.uid);
    }
  }

  logout() {
    this.isUser = false;
    this.auth.logout();
  }

  open(content) {
    this.modalRef = this.modalService.open(content);
  }

}
