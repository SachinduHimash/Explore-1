// eslint-disable-next-line no-unused-vars
import {AngularFirestore} from 'angularfire2/firestore';
import {FormControl, FormGroup, Validators} from '@angular/forms';
// eslint-disable-next-line no-unused-vars
import {GroupService} from '../services/group.service';
// eslint-disable-next-line no-unused-vars
import {Component, Input, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';

// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css']
})
export class CreateGroupComponent implements OnInit {

  @Input() groupDetails;
  @Input() modalRef;

  gnameExists = false;
  ogname;
  uid;

  description;
  gname;
  group;

  filename;
  inputFile;
  photoURL = '../../assets/images/default-profile.jpg';

  groupForm = new FormGroup({
    gname: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(30)
    ]),
    desc: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(150)
    ])
  });

  constructor(
    private auth: AuthService,
    private groupService: GroupService,
    private afs: AngularFirestore
  ) {
  }

  get Gname() {
    return this.groupForm.get('gname');
  }

  get Desc() {
    return this.groupForm.get('desc');
  }

  ngOnInit() {
    this.auth.getAuthState().subscribe(currUser => {
      if (currUser) {
        this.uid = currUser.uid;
      }
    });
    if (this.groupDetails) {
      this.groupService.getGroup(this.groupDetails.gid).subscribe(groupDoc => {
        this.gname = groupDoc.gname;
        this.ogname = groupDoc.gname;
        this.description = groupDoc.desc;
      });
    }
  }

  checkName($event) {
    const name = $event.target.value;
    this.afs.collection('groups', ref => ref.where('gname', '==', name)).valueChanges().subscribe(groupDoc => {
      const searchGroup: any = groupDoc[0];
      if (groupDoc[0] && this.ogname !== searchGroup.gname) {
        this.gnameExists = true;
        console.log('Group name exists', this.gnameExists);
      } else {
        this.gnameExists = false;
      }
    });
  }

  createOrEdit() {
    if (!this.groupDetails) {
      this.createGroup();
    }
    if (this.groupDetails) {
      this.editGroup();
    }
  }

  createGroup() {
    if (!this.Gname.errors && !this.Desc.errors && !this.gnameExists) {
      const groupData = {
        admin: this.uid,
        gname: this.gname,
        desc: this.description,
        bannerURL: this.photoURL
      };
      this.groupService.createGroup(groupData);
      this.modalRef.close();
    }
  }

  editGroup() {
    if (!this.Gname.errors && !this.Desc.errors && !this.gnameExists) {
      const groupData = {
        gname: this.gname ? this.gname : this.groupDetails.gname,
        desc: this.description ? this.description : this.groupDetails.desc,
        gid: this.groupDetails.gid,
      };
      this.groupService.editGroup(groupData);
      this.modalRef.close();
    }
  }

  processImage(event) {
    this.inputFile = event.target.files[0];
    this.filename = this.inputFile.name;
    if (this.filename.length > 25) {
      this.filename = this.filename.slice(0, 25) + '...' + this.filename.slice(this.filename.length - 3);
    }
  }

}
