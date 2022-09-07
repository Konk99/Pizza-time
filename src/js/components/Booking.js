import {select, templates} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class Booking{
  constructor(wrapper){
    const thisBooking = this;
        
    thisBooking.render(wrapper);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    const GeneratedHTML = templates.bookingWidget();
    
    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = GeneratedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;
    
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}