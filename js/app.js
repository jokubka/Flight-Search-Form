document.querySelector(".flight-search-form").reset();

// AUTOCOMPLETE FOR AIRPORT SEARCH

const input_point_a = document.querySelector(".form-field__point-a");
const input_point_b = document.querySelector(".form-field__point-b");
const swap_btn = document.querySelector(".swap-btn");
let autocomplete_airport_code_a = "";
let autocomplete_airport_code_b = "";

const getAutocompleteData = async input => {
  try {
    const response = await fetch(
      `https://cors-anywhere.herokuapp.com/https://aviazon.com/lt/pigus-skrydziai/autocomplete/${input}?v=3`
    );
    const data = await response.text();
    return data;
  } catch (err) {
    console.error(err);
  }
};

function autocompleteSelectHandler() {
  const autocomplete_box_a = document.querySelector(".autocomplete-box-a");
  const autocomplete_box_b = document.querySelector(".autocomplete-box-b");

  if (this.offsetParent.classList.contains("autocomplete-box-a")) {
    input_point_a.value = this.dataset.text;
    autocomplete_airport_code_a = this.dataset.code;
    autocomplete_box_a.innerHTML = "";
    point_a_tooltip.classList.add("hide");
    flightCalendar();
    return;
  }
  if (this.offsetParent.classList.contains("autocomplete-box-b")) {
    input_point_b.value = this.dataset.text;
    autocomplete_airport_code_b = this.dataset.code;
    autocomplete_box_b.innerHTML = "";
    point_b_tooltip.classList.add("hide");
    flightCalendar();
    return;
  }
}

const autocompleteHandler = async (event, input_field) => {
  const input_val = event.target.value;
  const autocomplete_box_a = document.querySelector(".autocomplete-box-a");
  const autocomplete_box_b = document.querySelector(".autocomplete-box-b");
  let autocomplete_output = "";

  if (input_val.length >= 3) {
    autocomplete_output = await getAutocompleteData(input_val);
  } else {
    return;
  }

  switch (input_field) {
    case "a":
      autocomplete_box_a.innerHTML = `<ul>${autocomplete_output}</ul>`;
      break;

    case "b":
      autocomplete_box_b.innerHTML = `<ul>${autocomplete_output}</ul>`;
      break;
  }

  const autocomplete_box_items = document.querySelectorAll(".item");

  autocomplete_box_items.forEach(item => {
    item.addEventListener("click", autocompleteSelectHandler);
  });
};

const airportSwapHandler = () => {
  if (autocomplete_airport_code_a && autocomplete_airport_code_b) {
    let point_a_name = input_point_a.value;
    let point_b_name = input_point_b.value;

    [autocomplete_airport_code_a, autocomplete_airport_code_b] = [
      autocomplete_airport_code_b,
      autocomplete_airport_code_a
    ];
    [point_a_name, point_b_name] = [point_b_name, point_a_name];

    input_point_a.value = point_a_name;
    input_point_b.value = point_b_name;

    flightCalendar();
  } else {
    return;
  }
};

input_point_a.addEventListener("input", event => {
  autocompleteHandler(event, "a");
});
input_point_b.addEventListener("input", event => {
  autocompleteHandler(event, "b");
});
swap_btn.addEventListener("click", airportSwapHandler);

// ONE-WAY OR ROUNDTRIP SELECTION

const input_radio = document.querySelectorAll(".trip-radio-input");
const calendar_clear_btn = document.querySelector(".clear-btn");
const input_date_return = document.querySelector(".form-field__date-return");

function roundtripHandler() {
  const returnDateInput = document.querySelector(".form-field__date-return");
  if (this.value === "one-way" || this.classList.contains("clear-btn")) {
    input_radio[1].checked = true;
    calendar_clear_btn.classList.add("hide");
    returnDateInput.value = "Skrydis atgal";
    returnDateInput.style =
      "background-color: #E8E8E8; color: #888; padding-right:0";
  }
  if (this.value === "round-trip" || this.value === "Skrydis atgal") {
    input_radio[0].checked = true;
    calendar_clear_btn.classList.remove("hide");
    returnDateInput.style =
      "background-color: #fff; color: #262626; padding-right:40px";
    date_return.setDate(new Date(date_week_after), true);
  }
}

input_date_return.addEventListener("click", roundtripHandler);
calendar_clear_btn.addEventListener("click", roundtripHandler);
input_radio.forEach(input => {
  input.addEventListener("change", roundtripHandler);
});

// CALENDAR FOR DATEPICKER

const date = new Date();
const date_tomorow =
  date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate() + 1);
const date_week_after =
  date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + (date.getDate() + 7);
let departure_calendar = [];
let return_calendar = [];

let date_departure = datepicker(".form-field__date-departure", {
  dateSelected: new Date(date_tomorow),
  startDay: 1,
  formatter: (input, date, instance) => {
    const value =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    input.value = value;
  }
});

let date_return = datepicker(".form-field__date-return", {
  dateSelected: new Date(date_week_after),
  startDay: 1,
  formatter: (input, date, instance) => {
    const value =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    input.value = value;
  }
});

const flightCalendar = async () => {
  if (autocomplete_airport_code_a && autocomplete_airport_code_b) {
    const response = await fetch(
      `https://cors-anywhere.herokuapp.com/https://aviazon.com/api/direct-dates/roundtrip/${autocomplete_airport_code_a}c/${autocomplete_airport_code_b}c`
    );
    const data = await response.json();
    departure_calendar = data.data.departure.map(date => {
      const dateTransformed = date.split("-");
      dateTransformed[1] - 1;
      dateTransformed.join(" ");

      return new Date(dateTransformed);
    });
    return_calendar = data.data.return.map(date => {
      const dateTransformed = date.split("-");
      dateTransformed[1] - 1;
      dateTransformed.join(" ");

      return new Date(dateTransformed);
    });

    date_departure.remove();
    date_return.remove();

    date_departure = datepicker(".form-field__date-departure", {
      formatter: (input, date, instance) => {
        const value =
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate();
        input.value = value;
      },
      startDay: 1,
      events: [...departure_calendar]
    });

    date_return = datepicker(".form-field__date-return", {
      formatter: (input, date, instance) => {
        const value =
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate();
        input.value = value;
      },
      startDay: 1,
      events: [...departure_calendar]
    });
  } else {
    return;
  }
};

// QUANTITY OF PASSENGERS SELECTION

const passenger_add_remove_btn = document.querySelectorAll(".counter-icon");
const passenger_click_area = document.querySelector(".click-area");
const passenger_submit_btn = document.querySelector(".passenger-submit-btn");

function passengerBoxToggleHandler() {
  const passenger_select_box = document.querySelector(".passenger-select-box");
  passenger_select_box.classList.toggle("hide");
}

const countTotalPassengers = (adults, children, infants) => {
  const total = `${adults == 1 ? adults + " Suaugęs" : adults + " Suaugę"}${
    children == 1 ? ", " + children + " Vaikas" : ""
  }${children > 1 ? ", " + children + " Vaikai" : ""}${
    infants == 1 ? ", " + infants + " Kūdikis" : ""
  }${infants > 1 ? ", " + infants + " Kūdikiai" : ""}`;
  return total;
};

function passengersCounterHandler() {
  const adult_counter_el = document.querySelector("#passenger-adult");
  const children_counter_el = document.querySelector("#passenger-children");
  const infant_counter_el = document.querySelector("#passenger-infant");
  const total_passengers = document.querySelector(
    ".click-area__passenger-input"
  );
  const passenger_type = this.dataset.passenger;
  const operator = this.dataset.operator;

  switch (passenger_type) {
    case "adult":
      if (operator === "plus") {
        adult_counter_el.value++;
      }
      if (operator === "minus" && adult_counter_el.value > 1) {
        adult_counter_el.value--;
      }
      break;
    case "children":
      if (operator === "plus") {
        children_counter_el.value++;
      }
      if (operator === "minus" && children_counter_el.value > 0) {
        children_counter_el.value--;
      }
      break;
    case "infant":
      if (operator === "plus") {
        infant_counter_el.value++;
      }
      if (operator === "minus" && infant_counter_el.value > 0) {
        infant_counter_el.value--;
      }
      break;
  }

  total_passengers.value = countTotalPassengers(
    adult_counter_el.value,
    children_counter_el.value,
    infant_counter_el.value
  );
}

const showPassengersTooltipHandler = () => {
  const tooltip = document.querySelector(".passenger-tooltip");
  const total_passengers_el = document.querySelector(
    ".click-area__passenger-input"
  );
  const html_output = total_passengers_el.value
    .split(",")
    .map(passenger => `<span>${passenger.trim()}</span>`)
    .join("");

  tooltip.innerHTML = html_output;
  tooltip.classList.toggle("hide");
};

passenger_add_remove_btn.forEach(btn => {
  btn.addEventListener("click", passengersCounterHandler);
});
passenger_click_area.addEventListener("click", passengerBoxToggleHandler);
passenger_submit_btn.addEventListener("click", passengerBoxToggleHandler);
passenger_click_area.addEventListener(
  "mouseover",
  showPassengersTooltipHandler
);
passenger_click_area.addEventListener("mouseout", showPassengersTooltipHandler);

// FORM VALIDATION
const flight_search_form = document.querySelector(".flight-search-form");
const point_a_tooltip = document.querySelector(".point-a-tooltip");
const point_b_tooltip = document.querySelector(".point-b-tooltip");

function formValidationHandler(event) {
  event.preventDefault();

  if (autocomplete_airport_code_a.length === 0) {
    point_a_tooltip.textContent = "Įveskite teisingą vietą";
    point_a_tooltip.classList.remove("hide");
  }
  if (input_point_a.value.length === 0) {
    point_a_tooltip.textContent = "Šis laukas yra privalomas";
    point_a_tooltip.classList.remove("hide");
  }
  if (autocomplete_airport_code_b.length === 0) {
    point_b_tooltip.textContent = "Įveskite teisingą vietą";
    point_b_tooltip.classList.remove("hide");
  }
  if (input_point_b.value.length === 0) {
    point_b_tooltip.textContent = "Šis laukas yra privalomas";
    point_b_tooltip.classList.remove("hide");
  }
}

flight_search_form.addEventListener("submit", function() {
  formValidationHandler(event);
});
