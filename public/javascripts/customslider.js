$(function(){
  $("#slider").dateRangeSlider();
  $("#slider").dateRangeSlider("bounds", new Date(1980, 0, 1), new Date(1984, 11, 31));
  $("#slider").dateRangeSlider("values", new Date(1980, 0, 1), new Date(1984, 11, 31));
});