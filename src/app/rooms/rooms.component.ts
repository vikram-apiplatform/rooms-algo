import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api.service";
import {MatDialog} from "@angular/material/dialog";
import {EditUserNameComponent} from "../edit-user-name/edit-user-name.component";

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  rooms: any = 40;
  buildings: any = 5;
  days: any = 20;
  roomsPerBuilding: any;
  numberOfRows: number[];
  numberOfDays: number[];
  maxAllowableBuildings = 2;
  maxAllowableRooms: any;
  // usersList: any = [];
  usersList: any = [
    {
      "name": "Vikram",
      "max_allowable_buildings": 5,
      "selected_buildings": [
        1,
        2,
        3,
        4,
        5
      ],
      "max_allowable_rooms": 20
    },
    {
      "name": "Saldin",
      "max_allowable_buildings": 3,
      "selected_buildings": [
        2,
        4,
        5
      ],
      "max_allowable_rooms": 12
    }
  ];
  room_allocated: any = [];
  selected_buildings: any = [];
  rowClicked: any = {};
  selectedValues: any = [];


  constructor(private apiService: ApiService,
              public dialog: MatDialog) {
    this.roomsPerBuilding = this.rooms / this.buildings;
    this.maxAllowableRooms = this.maxAllowableBuildings * this.roomsPerBuilding;
    this.numberOfRows = Array(this.rooms).fill(0).map((x, i) => i);
    this.numberOfDays = Array(this.days).fill(0).map((x, i) => i + 1);
    // console.log(this.numberOfRows)
    this.buildingsValueChange();
  }

  ngOnInit(): void {
  }


  maxAllowableBuildingsValueChange() {
    this.maxAllowableRooms = this.maxAllowableBuildings * this.roomsPerBuilding;

  }

  daysValueChange() {
    this.numberOfDays = Array(this.days).fill(0).map((x, i) => i + 1);
  }

  roomsValueChange() {
    this.numberOfRows = Array(this.rooms).fill(0).map((x, i) => i);
    // console.log(this.numberOfRows);
    this.buildingsValueChange();
  }

  buildingsValueChange() {
    this.roomsPerBuilding = this.rooms / this.buildings;
    this.selected_buildings = [];
    this.maxAllowableBuildingsValueChange();
  }

  getBuildingNumber(roomNumber: any) {
    this.roomsPerBuilding = this.rooms / this.buildings;
    return Math.ceil(roomNumber / this.roomsPerBuilding) + 1;
  }

  cellClicked(row: any, column: any) {
    // console.log(row, column)
    this.rowClicked = {
      row: row,
      column: column
    };
    // console.log('Building', this.getBuildingNumber(row + 1) - 1)
  }

  checkboxChanged(row: any, event: any) {
    // console.log(row, event.checked)
    this.selected_buildings[row - 1].checked = event.checked;
    // console.log(this.selected_buildings);
  }

  getAllocatedValue(row: any, column: any) {
    let flag = false;
    if (this.selectedValues && this.selectedValues.length > 0) {
      for (let item of this.selectedValues) {
        if (item.row == row && item.column == column - 1) {
          flag = true;
          // return 'user ' + item.value;
          return item.value;
        }
      }
    }
    if (!flag) {
      if (this.room_allocated.length > 0) {
        // return this.room_allocated[row][column - 1] != 0 ? 'user ' + this.room_allocated[row][column - 1] : '';
        return this.room_allocated[row][column - 1] != null ? this.room_allocated[row][column - 1] : '';
      } else {
        return '';
      }
    }

    return '';
  }

  assignRoom() {

    let tempUsers = [];
    for (let user of this.usersList) {
      tempUsers.push(user.name);
    }

    let restrictions_list: any = []
    for (let user of this.usersList) {
      // console.log(user.name, user.selected_buildings);
      let restrictions_obj: any = {
        name: user.name,
        restrictions: []
      };
      for (let building_number of user.selected_buildings) {
        for (let i = 0; i < this.rooms; i++) {
          // console.log(i, this.getBuildingNumber(i + 1) - 1)
          if (building_number == this.getBuildingNumber(i + 1) - 1) {
            restrictions_obj['restrictions'].push(i)
          }
        }
      }
      restrictions_list.push(restrictions_obj);
    }
    // console.log(restrictions_list);


    let payload = {
      rows: this.rooms,
      columns: this.days,
      users: tempUsers,
      assignments: this.selectedValues,
      restrictions: restrictions_list
    };
    this.selectedValues = [];
    // console.log(payload);
    this.apiService.get_rooms(payload).subscribe(res => {
      // console.log(res);
      if (res) {
        this.room_allocated = res;
      }
    });
  }

  selectedUser(user: any) {
    let obj: any = {
      row: this.rowClicked.row,
      column: this.rowClicked.column - 1,
      value: user.name,
      user_details: user
    };
    this.selectedValues.push(obj);

    // console.log(this.selectedValues);
  }


  getUserList() {
    let temp = [];
    for (let user of this.usersList) {
      if (user.selected_buildings.includes(this.getBuildingNumber(this.rowClicked.row + 1) - 1)) {
        temp.push(user)
      }
    }
    return temp;
  }

  addUsers() {
    const dialogRef = this.dialog.open(EditUserNameComponent, {
      width: '80vw',
      minHeight: '30vh',
      maxHeight: '90vh',
      data: {
        total_buildings: this.buildings,
        rooms_per_building: this.roomsPerBuilding,
        usersList: this.usersList
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.userList) {
        this.usersList = result.userList;
        // console.log(this.usersList);
      }
    });
  }


  downloadTable() {
    const table: any = document.querySelector('table');
    const html = table.outerHTML;
    const blob = new Blob([html], {type: 'text/html'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'table.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
