jQuery(document).ready(function($){
  //open the lateral panel
  $('#side-button').on('click', function(event){
    
    if($('.cd-panel').hasClass('is-visible'))
    {
      $('.cd-panel').removeClass('is-visible');
      $(this).children('i').removeClass('mdi-navigation-arrow-forward');
      $(this).children('i').addClass('mdi-navigation-arrow-back')
             .css({'font-size': '48px', 'color': 'white'});
      $(this).css({ 'right': '0%'});
    }
    else
    {
      $('.cd-panel').addClass('is-visible');
      $('.cd-panel').css({'z-index': '9999'});
      $(this).children('i').removeClass('mdi-navigation-arrow-back');
      $(this).children('i').addClass('mdi-navigation-arrow-forward')
             .css({'font-size': '48px', 'color': 'white'});
      $(this).css({ 'right': '42%'});
    }
    event.preventDefault();
  });
  //clode the lateral panel
});