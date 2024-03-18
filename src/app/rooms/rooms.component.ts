import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api.service";

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  rooms: any = 20;
  buildings: any = 5;
  days: any = 10;
  users: any = 10;
  roomsPerBuilding: any;
  numberOfRows: number[];
  numberOfDays: number[];
  maxAllowableBuildings = 2;
  maxAllowableRooms: any;
  usersList: any;
  room_allocated: any = [];
  selected_buildings: any = [];
  rooms_not_seleted: any = [];


  selectedBuilding: any = [];
  rowClicked: any = {};
  selectedValues: any = [];


  constructor(private apiService: ApiService) {
    this.roomsPerBuilding = this.rooms / this.buildings;
    this.maxAllowableRooms = this.maxAllowableBuildings * this.roomsPerBuilding;
    this.numberOfRows = Array(this.rooms).fill(0).map((x, i) => i);
    this.numberOfDays = Array(this.days).fill(0).map((x, i) => i + 1);
    this.usersList = Array(this.users).fill(0).map((x, i) => i + 1);
    console.log(this.numberOfRows)
    this.buildingsValueChange();
  }

  ngOnInit(): void {
  }

  usersValueChange(){
    this.usersList = Array(this.users).fill(0).map((x, i) => i + 1);
  }

  maxAllowableBuildingsValueChange() {
    this.maxAllowableRooms = this.maxAllowableBuildings * this.roomsPerBuilding;

  }

  daysValueChange() {
    this.numberOfDays = Array(this.days).fill(0).map((x, i) => i + 1);
  }

  roomsValueChange() {
    this.numberOfRows = Array(this.rooms).fill(0).map((x, i) => i);
    console.log(this.numberOfRows);
    this.buildingsValueChange();
  }

  buildingsValueChange() {
    this.roomsPerBuilding = this.rooms / this.buildings;
    this.selected_buildings = [];
    for (let i = 0; i < this.buildings; i++) {
      let obj = {
        checked: false
      };
      this.selected_buildings.push(obj)

    }
    console.log(this.selected_buildings);


    this.maxAllowableBuildingsValueChange();
  }

  getBuildingNumber(roomNumber: any) {
    this.roomsPerBuilding = this.rooms / this.buildings;
    return Math.ceil(roomNumber / this.roomsPerBuilding) + 1
  }

  cellClicked(row: any, column: any) {
    console.log(row, column)
    this.rowClicked = {
      row: row,
      column: column
    };
  }

  checkboxChanged(row: any, event: any) {
    // console.log(row, event.checked)
    this.selected_buildings[row - 1].checked = event.checked;
    console.log(this.selected_buildings);
  }

  getAllocatedValue(row: any, column: any) {
    let flag = false;
    if (this.selectedValues && this.selectedValues.length > 0) {
      for (let item of this.selectedValues) {
        if (item.row == row && item.column == column - 1) {
          flag = true;
          return 'user ' + item.value;
        }
      }
    }
    if (!flag) {
      if (this.room_allocated.length > 0) {
        return this.room_allocated[row][column - 1] != 0 ? 'user ' + this.room_allocated[row][column - 1] : '';
      } else {
        return '';
      }
    }

    return '';
  }

  assignRoom() {

    this.rooms_not_seleted = [];
    for (let i = 1; i <= this.rooms; i++) {
      let building_number = this.getBuildingNumber(i);
      console.log(i, building_number)
      if (this.selected_buildings && this.selected_buildings.length > 0 && !this.selected_buildings[building_number - 2].checked) {
        this.rooms_not_seleted.push(i - 1);
      }

    }
    console.log(this.rooms_not_seleted);
    let payload = {
      rows: this.rooms,
      columns: this.days,
      zero_rows: this.rooms_not_seleted,
      users: this.usersList,
      assignments: this.selectedValues
    };
    this.selectedValues = [];
    this.apiService.get_rooms(payload).subscribe(res => {
      console.log(res);
      if (res) {
        this.room_allocated = res;
      }
    });
  }

  selectedUser(user: any) {
    let obj: any = {
      row: this.rowClicked.row,
      column: this.rowClicked.column - 1,
      value: user
    };
    this.selectedValues.push(obj);

    console.log(this.selectedValues);
  }

}
