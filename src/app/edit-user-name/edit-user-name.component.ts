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
  total_buildings: any = 0;
  username: any;
  usersList: any = [];
  allowale_buildings = 0;
  allowable_rooms = 0;
  rooms_per_building = 0;
  max_allowable_rooms = 0;
  selectedBuildings: any = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<EditUserNameComponent>, private _snackBar: MatSnackBar) {
    if (data) {
      this.total_users = data.total_users;
      this.total_buildings = data.total_buildings;
      this.allowale_buildings = this.total_buildings;
      this.rooms_per_building = data.rooms_per_building;
      this.allowable_rooms = this.total_buildings * this.rooms_per_building;
      this.max_allowable_rooms = this.total_buildings * this.rooms_per_building;
    }
  }

  ngOnInit(): void {
    console.log(this.data);
  }

  isSelectionLimitReached(): boolean {
    return this.selectedBuildings.length >= this.allowale_buildings;
  }

  range(start: number, end: number): number[] {
    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }

  maxAllowableBuildingsValueChange() {
    this.allowable_rooms = this.allowale_buildings * this.rooms_per_building;
    this.selectedBuildings = [];
  }

  add() {
    if (this.usersList.length <= this.total_users - 1) {

      if (this.username && this.username !== '') {
        if (!this.usersList.includes(this.username)) {
          let obj = {
            name: this.username,
            max_allowable_buildings: this.allowale_buildings,
            selected_buildings: this.selectedBuildings,
            max_allowable_rooms: this.allowable_rooms
          };
          this.usersList.push(obj);
          this._snackBar.open('User added', 'x', {
            duration: 2000
          });
          this.username = '';
        } else {
          this._snackBar.open('User already added', 'x', {
            duration: 2000
          });
          this.username = '';
        }
      } else {
        this._snackBar.open('Enter user name', 'x', {
          duration: 2000
        });

      }
    } else {
      this._snackBar.open('User list already full', 'x', {
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
