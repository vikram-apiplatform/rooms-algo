import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-edit-user-name',
  templateUrl: './edit-user-name.component.html',
  styleUrls: ['./edit-user-name.component.scss']
})
export class EditUserNameComponent implements OnInit {
  total_users: any = 0;
  username: any;
  usersList: any = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<EditUserNameComponent>, private _snackBar: MatSnackBar) {
    if (data) {
      this.total_users = data.total_users;
    }
  }

  ngOnInit(): void {
    console.log(this.data);
  }

  add() {
    if (this.usersList.length <= this.total_users - 1) {

      if (this.username && this.username !== '') {
        if (!this.usersList.includes(this.username)) {
          this.usersList.push(this.username);
          this._snackBar.open('User added', 'x',{
            duration: 2000
          });
          this.username = '';
        } else {
          this._snackBar.open('User already added', 'x',{
            duration: 2000
          });
          this.username = '';
        }
      } else {
        this._snackBar.open('Enter user name', 'x',{
          duration: 2000
        });

      }
    } else {
      this._snackBar.open('User list already full', 'x',{
        duration: 2000
      });

    }
  }

  save() {
    this.dialogRef.close({userList: this.usersList});

  }


  closeDialog() {
    this.dialogRef.close({});
  }

}
