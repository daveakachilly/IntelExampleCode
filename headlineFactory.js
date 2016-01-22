//headlineFactory    This factory reads data from the backend and writes data to the backend after checking each input

(function() {
  'use strict';

  angular.module('app.main').factory('headlineFactory', headlineFactory);

  function headlineFactory(intcWebRequest,intcConfigurator, sharedProperties, $route, $timeout, toaster) {
    var getHeadlines = function(tile) {

      intcWebRequest.request(intcConfigurator.config.serviceRoot + '/Headlines/' + tile.label).then(function (response) {

        if (response[0]) {

          var green = '#7BC03D';
          var yellow = '#FBC900';
          var red = '#FF2020';

          //ignore if 0
          if(response[0].Enabled != 0) {
            //values to decode special characters
            var encodedCharacters = ["p')", "p-)", "a')", "s')", "p_)", 
                                "c')", "q')", "l')", "g')", "s-)"];
            var specialCharacters = ["#", "%", "&", "*", "+", ":", "?", "<", ">", "/"];

            //Initialize as green
            tile.color = green;
            tile.id = response[0].ID;             
            tile.data = response[0].DataValue;             
            tile.headline = response[0].Headline;
            tile.data2 = response[0].DataValue2;             
            tile.headline2 = response[0].Headline2;
            tile.lowColor = response[0].LowColor;
            tile.lastUpdated = response[0].LastUpdated;

            //reduces space to headlines with "%" or "x " in front
            if(tile.headline.substring(0,3) == "p-)" || tile.headline.substring(0,2) == "x ") {
              document.getElementById("data-"+tile.label).style.marginRight="-1%";
            }
            if(tile.headline2.substring(0,3) == "p-)" || tile.headline2.substring(0,2) == "x ") {
              document.getElementById("data2-"+tile.label).style.marginRight="-1%";
            }

            //decode special characters before displaying 
            for (var i = specialCharacters.length - 1; i >= 0; i--) {

              tile.headline = tile.headline.replace(encodedCharacters[i], specialCharacters[i]);
              tile.headline2 = tile.headline2.replace(encodedCharacters[i], specialCharacters[i]);
              tile.lastUpdated = tile.lastUpdated.replace(encodedCharacters[i], specialCharacters[i]);

              if(tile.headline2 == "no headline available") {
                document.getElementById(tile.label).innerHTML = "</br>";
                tile.data2 = "";
                tile.headline2 = "";
              }
              else tile.spacer = "";
            };

            //display empty string in model if yellow upper bound was blank when model submitted
            if(response[0].HighDataBound == -1212) {
              tile.highBound = "";
            }
            else {
              tile.highBound = response[0].HighDataBound;
            }

            //display empty string in model if no email address
            if(response[0].OwnerEmailAddress == "undefined") {   
              tile.mail = "";
            }
            else {
              tile.mail = response[0].OwnerEmailAddress
            }

            if(response[0].LowDataBound == -1212) {
              tile.lowBound = "";
            }
            else {
              tile.lowBound = response[0].LowDataBound;
            }

            if (tile.data) {
              if((tile.data <= tile.highBound) && (tile.data >= tile.lowBound)) {    // Checks for data between color bounds
                tile.color = yellow;
              }
              else {
                if (tile.lowColor === 1) { // 1 == green low color                
                  if(tile.data < tile.lowBound) {
                    tile.color = green;
                  }
                  else if (tile.data > tile.highBound) {
                    tile.color = red;
                  } 
                }
                else if (tile.lowColor === 2)                                     // 2 == red low color
                {
                  if(tile.data < tile.lowBound) {
                    tile.color = red;
                  }
                  else if (tile.data > tile.highBound) {
                    tile.color = green;
                  } 
                }
              }
            }

            if(response[0].DataValue == -1212) {
              document.getElementById("data-"+tile.label).innerHTML = "";
            }
            
            if(response[0].DataValue2 == -1212) {
              document.getElementById("data2-"+tile.label).innerHTML = "";
            }
          }
        }
        else
        {
          tile.headline = "no headline available";
        }

      }, function (errorResponse) {
          toaster.pop('error', 'Error loading the client data.');
          return errorResponse;
        });      
    }//getHeadlines()

    var checkLowBound = function(isGreen) {
      if(isGreen.name == "green") {        
        return 1; //green lower bound
      }
      else {        
        return 2; //red lower bound
      }
    } //checkLowBound()

    var checkEnabled = function(enabled) {
      if(enabled) {        
        return 2; //automatic
      }
      else {        
        return 1; //manual
      }
    }//checkEnabled()

    var checkDataValue = function(dataValue) {
      console.log(dataValue);
      if(dataValue == "") {
        return -1212; 
      } 
      else {
        return dataValue;
      }
    } //checkDataValue()

    var checkHeadline = function(headline) {
 
      var encodedCharacters = ["p')", "p-)", "a')", "s')", "p_)", 
                              "c')", "q')", "l')", "g')", "s-)"];

      var specialCharacters = ["#", "%", "&", "*", "+", ":", "?", "<", ">", "/"];

      //encodes special characters
      for (var i = specialCharacters.length - 1; i >= 0; i--) {
        headline = headline.replace(specialCharacters[i], encodedCharacters[i]);
      };
      
      if(headline == "") {
        return "no headline available";
      } 
      else {
        return headline;
      }
    } //checkHeadline()

    var checkLowYellowBound = function(lowYellow) {
      if(lowYellow == "") {
        return -1212;
      }
      else {
        return lowYellow;
      }
    } //checkLowYellowBound()

    var checkEmail = function(email) {
      if(email == "") {
        return null;
      }
      else {
        return email;
      }
    } //checkEmail()

    var checkUpperYellowBound = function(highYellow) {
      if(highYellow == "") {
        return -1212;
      } 
      else {
        return highYellow;
      }
    } //checkUpperYellowBound()

    var reloadPage = function($route, $timeout, toaster) {
      $timeout($route.reload(),500);
      toaster.pop('success', 'headline saved');
    }

    var updateTileData = function() {

      var tileData = {
        Tile: sharedProperties.adminInputs.Tile,
        AutomaticEnabled: sharedProperties.adminInputs.Automatic,
        DataValue: sharedProperties.adminInputs.DataValue,
        Headline: sharedProperties.adminInputs.Headline,
        DataValue2: sharedProperties.adminInputs.DataValue2,
        Headline2: sharedProperties.adminInputs.Headline2,
        LowDataBound: sharedProperties.adminInputs.LowDataBound,
        HighDataBound: sharedProperties.adminInputs.HighDataBound,
        LowColor: sharedProperties.adminInputs.LowerBound,
        OwnerEmail: sharedProperties.adminInputs.Owner,
        LastUpdated: sharedProperties.adminInputs.LastUpdated,
        ID: sharedProperties.id
      }

      return intcWebRequest.request(intcConfigurator.config.serviceRoot +
        '/HeadlinesInput/' + tileData.ID + '/' + tileData.Tile + '/' + tileData.DataValue + '/'  +
        tileData.Headline + '/' + tileData.LowDataBound + '/' + tileData.HighDataBound + '/' + tileData.LowColor + '/' +
        tileData.OwnerEmail + '/' + 0 + '/' + tileData.AutomaticEnabled + '/green/'+ tileData.LastUpdated + '/' + tileData.DataValue2 + '/' + tileData.Headline2).then(function (response) {
          $timeout($route.reload(),500);
          toaster.pop('success', 'headline saved')
        }, function(errorResponse){
          toaster.pop('error', 'Error: could not save. Invalid or incomplete inputs');
          return errorResponse;
        });
    } //updateTileData()

    return {
      getHeadlines: getHeadlines,
      checkLowBound: checkLowBound,
      checkEnabled: checkEnabled,
      checkDataValue: checkDataValue,
      checkHeadline: checkHeadline,
      checkLowYellowBound: checkLowYellowBound,
      checkUpperYellowBound: checkUpperYellowBound,
      checkEmail: checkEmail,
      updateTileData: updateTileData
    }
  }
})();