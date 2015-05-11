function warmup()
{
  warmUpSite("http://maydayviz.azurewebsites.net/1980-visualization");
}

function warmUpSite(url)
{
  console.log("Warming Up: " + url);

  var request = require('request');

  request.get({ url: url }, function(error, response, body){
        if(!error) 
        {
            console.info("hot hot hot! " + url);
        }
        else 
        {
            console.error('error warming up ' + url + ': ' + error);
        }       
    });
}