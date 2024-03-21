import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {ApiService} from "../api.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {EditUserNameComponent} from "../edit-user-name/edit-user-name.component";
import {DatePipe} from "@angular/common";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  rooms: any = 40;
  names = ['வடக்கு','மேற்கு','கிழக்கு','தெற்கு'];
  buildings: any = 4;
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
      "max_allowable_buildings": 4,
      "selected_buildings": [
        1,
        2,
        3,
        4
      ],
      "max_allowable_rooms": 40
    },
    {
      "name": "Saldin",
      "max_allowable_buildings": 2,
      "selected_buildings": [
        2,
        4
      ],
      "max_allowable_rooms": 20
    }
  ];
  room_allocated: any = [];
  selected_buildings: any = [];
  rowClicked: any = {};
  selectedValues: any = [];
  startDate: any = new Date();


  buildings_list: any = [];
  rooms_list: any = [];
  selectedBuildings: any = [];
  selectedPlan: any;
  plans: any = [];
  loading = false;
  loading1 = false;
  loading2 = false;

  @ViewChild('excelTable', {static: false}) excelTable: any;


  constructor(private apiService: ApiService, private _snackBar: MatSnackBar,
              public dialog: MatDialog, private datePipe: DatePipe) {
    this.roomsPerBuilding = this.rooms / this.buildings;
    this.maxAllowableRooms = this.maxAllowableBuildings * this.roomsPerBuilding;
    this.numberOfRows = Array(this.rooms).fill(0).map((x, i) => i);
    this.numberOfDays = Array(this.days).fill(0).map((x, i) => i + 1);
    // console.log(this.numberOfRows)
    this.buildingsValueChange();
  }

  ngOnInit(): void {
    this.loading = true;
    this.apiService.getBuildings().subscribe(res => {
      this.buildings_list = res;
      this.selectedBuildings = this.buildings_list;
      this.loading = false;
    });
    this.apiService.getRooms().subscribe(res => {
      this.rooms_list = res;
      this.loading = false;
    });
    this.getPlans();
  }

  getPlans() {
    this.apiService.getPlans().subscribe(res => {
      this.plans = res;
    });
  }

  isSelectionLimitReached(): boolean {
    return this.selectedBuildings.length >= this.buildings;
  }

  exportToCsv(): void {
    // Select the table element
    let table: any = document.getElementById('htmlData');

    // Initialize variables for CSV content and rows
    let csvContent = '';
    let rows = table.querySelectorAll('tr');

    // Iterate over rows and columns to build CSV content
    rows.forEach((row: any) => {
      let rowData: any = [];
      let rowIndex = 0;

      row.querySelectorAll('td, th').forEach((cell: any) => {
        let colspan = cell.getAttribute('colspan');
        let rowspan = cell.getAttribute('rowspan');
        let cellValue = cell.innerText;

        // Check if the cell has rowspan
        if (rowspan) {
          let rowspanValue = parseInt(rowspan);
          for (let i = 0; i < rowspanValue; i++) {
            rowData[rowIndex + i] = cellValue;
          }
        } else {
          rowData[rowIndex] = cellValue;
        }

        // Increment the row index by colspan value
        if (colspan) {
          rowIndex += parseInt(colspan);
        } else {
          rowIndex++;
        }
      });

      csvContent += rowData.join(',') + '\n';
    });

    // Create a Blob object with CSV content
    let blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});

    // Create a temporary anchor element
    let link = document.createElement('a');
    if (link.download !== undefined) { // Check if the browser supports the download attribute
      let url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'Rooms_Allocation_' + this.getCurrentDate() + '.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Your browser does not support the HTML5 download attribute.');
    }
  }

  getCurrentDate() {
    const today = new Date();
    let month: any = today.getMonth() + 1; // Months are zero-indexed, so we add 1
    let day: any = today.getDate();
    const year: any = today.getFullYear();

    // Add leading zeros if necessary
    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }

    return month + '/' + day + '/' + year;
  }

  save() {
    let payload = {
      name: "Plan",
      createdAt: Date.now(),
      total_rooms: this.rooms,
      total_buildings: this.buildings,
      total_days: this.days,
      startDate: Date.parse(this.startDate),
      users_details: this.usersList,
      pre_assignments: this.selectedValues,
      allocations: this.room_allocated
    };
    console.log(payload);


    const dialogRef = this.dialog.open(SaveDialog, {
      width: '350px',
      data: {plan_name: ''},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        payload['name'] = result;
        this.loading1 = true;
        this.apiService.savePlan(payload).subscribe(res => {
          this._snackBar.open('Plan saved successfully.', 'x', {
            duration: 2000
          });
          this.loading1 = false;

          this.getPlans();
        })
      }
    });
  }

  getColumnDays() {
    let temp: any = [];

    for (let i = 0; i < this.days; i++) {
      // let tempDate = this.datePipe.transform(this.startDate, 'MM-dd-yyyy');
      const nextDate = new Date(this.startDate);
      nextDate.setDate(this.startDate.getDate() + i);
      temp.push(this.datePipe.transform(nextDate, 'MM-dd-yyyy'))
    }
    return temp;
  }

  onDateChange(event: any) {

    console.log(this.startDate);
    console.log(this.datePipe.transform(this.startDate, 'MM-dd-yyyy'));
    // Do something with the selected date
  }

  maxAllowableBuildingsValueChange() {
    this.maxAllowableRooms = this.maxAllowableBuildings * this.roomsPerBuilding;

  }

  daysValueChange() {
    this.numberOfDays = Array(this.days).fill(0).map((x, i) => i + 1);
  }

  onPlansChange() {
    console.log(this.selectedPlan)
    if (this.selectedPlan) {
      this.selectedValues = [];
      this.rooms = this.selectedPlan.total_rooms;
      this.buildings = this.selectedPlan.total_buildings;
      this.days = this.selectedPlan.total_days;
      this.usersList = this.selectedPlan.users_details;
      this.room_allocated = this.selectedPlan.allocations;
      this.startDate = new Date(this.selectedPlan.startDate);
      this.buildingsValueChange();
    }
  }

  roomsValueChange() {
    this.numberOfRows = Array(this.rooms).fill(0).map((x, i) => i);
    // console.log(this.numberOfRows);
    this.buildingsValueChange();
  }

  buildingsValueChange() {
    this.selectedBuildings = [];
    this.roomsPerBuilding = this.rooms / this.buildings;
    this.selected_buildings = [];
    this.maxAllowableBuildingsValueChange();
  }

  getBuildingNumber(roomNumber: any) {
    this.roomsPerBuilding = this.rooms / this.buildings;
    return Math.ceil(roomNumber / this.roomsPerBuilding) + 1;
  }

  getBuildingName(roomNumber: any) {
    this.roomsPerBuilding = this.rooms / this.buildings;
    return  this.names[Math.ceil(roomNumber / this.roomsPerBuilding)];
  }

  getRoomName(index: any) {
    if (this.rooms_list) {
      return this.rooms_list[index - 1]['name'];
    }
    return 'Room';
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
    // this.selectedValues = [];
    // console.log(payload);
    this.loading2 = true;
    this.apiService.get_rooms(payload).subscribe(res => {
      // console.log(res);
      this.loading2 = false;
      if (res) {
        this.room_allocated = res;
      }
    },err =>{
      this.loading2 = false;
      this._snackBar.open('Error, Please try again.', 'x', {
        duration: 2000
      });
    });
  }

  selectedUser(user: any) {
    let obj: any = {
      row: this.rowClicked.row,
      column: this.rowClicked.column - 1,
      value: user.name,
      user_details: user
    };
    if (!this.selectedValues.includes(obj)) {
      this.selectedValues.push(obj);
    }

    console.log(this.selectedValues);
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


@Component({
  selector: 'save-dialog',
  templateUrl: 'save.html',
})
export class SaveDialog {
  constructor(public dialogRef: MatDialogRef<SaveDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}


@Component({
  selector: 'special-reservation',
  templateUrl: 'special-reservation.html',
})
export class SpecialReservationDialog {
  constructor(public dialogRef: MatDialogRef<SpecialReservationDialog>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

