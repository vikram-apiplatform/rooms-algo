import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserNameComponent } from './edit-user-name.component';

describe('EditUserNameComponent', () => {
  let component: EditUserNameComponent;
  let fixture: ComponentFixture<EditUserNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditUserNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUserNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
