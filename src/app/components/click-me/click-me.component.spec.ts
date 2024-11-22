import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickMeComponent } from './click-me.component';

describe('ClickMeComponent', () => {
  let component: ClickMeComponent;
  let fixture: ComponentFixture<ClickMeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClickMeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClickMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
