import {select, settings, templates} from '../settings.js';
import { utils } from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking{
  constructor(wrapper){
    const thisBooking = this;
        
    thisBooking.render(wrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  render(element){
    const thisBooking = this;

    const GeneratedHTML = templates.bookingWidget();
    
    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = GeneratedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets(){
    const thisBooking = this;
    
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }

  getData(){
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    //console.log(eventsCurrent);
    for(let data of eventsCurrent){
      console.log(data);
      thisBooking.makeBooked(data.date, data.duration, data.hour, data.table);
    }

    for(let data of bookings){
      console.log(data);
      thisBooking.makeBooked(data.date, data.duration, data.hour, data.table);
    }

    for(let data of eventsRepeat){
      //let count = 0;
      let days = new Date(thisBooking.datePicker.minDate);
      while(days <= thisBooking.datePicker.maxDate){
        //if(count > 100){break;}
        thisBooking.makeBooked(utils.dateToStr(days), data.duration, data.hour, data.table);

        //count++;
        days = utils.addDays(days,1);
      }
    }
  }

  makeBooked(date, duration, hour, table){
    const thisBooking = this;

    if(!thisBooking.booked[date]){
      thisBooking.booked[date] = {};
    }

    for(let i = 0; i < duration*2; i++){
      let newHour = utils.hourToNumber(hour) + i/2;

      if(!thisBooking.booked[date][newHour]){
        thisBooking.booked[date][newHour] = [];
      }
      thisBooking.booked[date][newHour].push(table);
    }
    

    console.log(thisBooking.booked);
  }
}