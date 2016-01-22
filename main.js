
(function (){
	'use strict';

	angular.module('app.main').controller('MainCtrl', MainCtrl);

	/* @ngInject */
	function MainCtrl($route, $scope, $timeout, toaster, sharedProperties, $modal, headlineFactory, $http) {
		var vm = this;

		vm.items = [
			// {label:'Malware',href:'https://sharepoint.amr.ith.intel.com/sites/iso/Shared%20Documents/InfoSec%20Command%20Center%20Dashboard/ISO%20Command%20and%20Control%20Malware.pptx'},
			// // {label:'BCDR',href:'https://sharepoint.amr.ith.intel.com/sites/iso/Shared%20Documents/InfoSec%20Command%20Center%20Dashboard/ISO%20Command%20and%20Control%20BCDR.pptx'},
			// {label:'BCDR',href:'/#/bcdr'},
			// {label:'Vuln',href:'https://sharepoint.amr.ith.intel.com/sites/iso/Shared%20Documents/InfoSec%20Command%20Center%20Dashboard/ISO%20Command%20and%20Control%20Vulnerability%20and%20Compliance.pptx'},
			// {label:'ITERP',href:'https://sharepoint.amr.ith.intel.com/sites/iso/Shared%20Documents/InfoSec%20Command%20Center%20Dashboard/ISO%20Command%20and%20Control%20ITERPs.pptx'},
			// {label:'PAA',href:'https://sharepoint.amr.ith.intel.com/sites/iso/Shared%20Documents/InfoSec%20Command%20Center%20Dashboard/ISO%20Command%20and%20Control%20PAA.pptx'},
			// {label:'SOx',href:'https://sharepoint.amr.ith.intel.com/sites/iso/Shared%20Documents/InfoSec%20Command%20Center%20Dashboard/ISO%20Command%20and%20Control%20CMF.pptx'}
		];

		init();

		function init(){

			document.body.background = "http://i.imgur.com/LQClSSk.png";
			var item = {};
			_.forEach($route.routes, function(route){
				item = {};

				if (!route.excludeFromTiles && !route.redirectTo){
					item.arrows = false;
					item.label = route.title;
					console.log(item.label);
					item.parent = route.parent;
					headlineFactory.getHeadlines(item);
					//hooks up each edit icon to each tile
					item.editItem = editItem;
					if (route.underConstruction){
						item.click = click;
						item.href = '#/';
					} else {
						if (route.secondary){
							item.href = route.secondary;
						} else {
							item.href = '#' + route.originalPath;
						}
					}				
					vm.items.push(item);
				}
			});


			
			_.sortBy(vm.items, 'label');

			var loadingCheck = function() {
  				if($http.pendingRequests.length > 0) 
  				{
  					vm.loading = true;
      				$timeout(loadingCheck);
  				} else 
  				{
					vm.loading = false;
  				}
			}

			$timeout(loadingCheck, 500);

		}

		function click(itemLabel){
			toaster.pop('warning', itemLabel + ' is under construction.');
		}

		function editItem(itemLabel, itemData, itemHeadline, itemLowerBound, itemUpperBound, itemLowerColor, itemOwner, itemID, item, lastUpdated, itemData2, itemHeadline2){
			sharedProperties.tileTitle = itemLabel;
			sharedProperties.tile = item;
			sharedProperties.dataValue = itemData;
            sharedProperties.headline = itemHeadline;
            sharedProperties.dataValue2 = itemData2;
            sharedProperties.headline2 = itemHeadline2;
            sharedProperties.lowerBound = itemLowerBound;
            sharedProperties.upperBound = itemUpperBound;
            sharedProperties.lowColor = itemLowerColor;
            sharedProperties.owner = itemOwner;
            sharedProperties.lastUpdated = lastUpdated;
            sharedProperties.id = itemID;

			open();

			function open() {

			var modalInstance = $modal.open({
				templateUrl: "pages/main/modalContent.html",
				controller: "ModalInstanceCtrl"
			});
		};	
		}

	}

	/*
	* AdminCtrl		This controller is nested inside the MainCtrl 
	*/
	angular.module('app.main').controller('AdminCtrl', AdminCtrl);

	function AdminCtrl($scope, $modal, $route, sharedProperties, $routeParams, $location, headlineFactory) {
		
		$scope.userIsAdmin = true;

		$scope.logoClick = function() {
			$scope.adminMode = $scope.adminMode === true ? false: true;

			if($scope.adminMode) document.body.background = "http://i.imgur.com/cI0v3tg.png";
			else document.body.background = "http://i.imgur.com/LQClSSk.png";
		}

		$scope.dashboards = ["ISO and CnC",
					 "Eng and Security Portfolio",
					 "InfoSec and Security & Governance Segment",
					 "Info Risk and SRM",
					 "Threat Management and Investigations",
					 "Identity and Access",
					 "Data Protection",
					 "IT Compliance",
					 "Intel Federal IT"];	
	};

	angular.module('app.main').controller("ModalInstanceCtrl", ModalInstanceCtrl);

	angular.module('app.main').directive('charLimit', function ($parse) {
	    return {
	        scope: {
	          charLimitLength: '='
	        },
	        link: function (scope, elm, attrs) {
	         
	          elm.bind('keypress', function(e){
	           
	            if(elm[0].value.length >= scope.charLimitLength){
	              e.preventDefault();
	              return false;
	            }
	          });
	        }
	    }   
	});

	function ModalInstanceCtrl($scope, $modalInstance, sharedProperties, headlineFactory, $route, $timeout, toaster) {
		var lowBound = -1;
		var enabled = -1;

		$scope.title = sharedProperties.tileTitle;
		$scope.dataValue = Number(sharedProperties.dataValue);
		$scope.headline = sharedProperties.headline;
		$scope.dataValue2 = Number(sharedProperties.dataValue2);
		$scope.headline2 = sharedProperties.headline2;

		$scope.lower = Number(sharedProperties.lowerBound);
		$scope.upper = Number(sharedProperties.upperBound);
		$scope.ownerEmail = sharedProperties.owner;
		$scope.lastUpdated = sharedProperties.lastUpdated;

		if(sharedProperties.lowColor == 1) {
			//green lower bound
			$scope.color = { name: "green" };
		}
		else
		{
			//red lower bound
			$scope.color = { name: "red" };
		}

		$scope.maxLength = 17; //max digits allowed

/*
		$scope.checkNoData = function() {
			if(Number(sharedProperties.dataValue) == -1212) {
			document.getElementById("dVal1").value = null;
			document.getElementById("dVal1").disabled = true;
		}


			if(Number(sharedProperties.dataValue2) == -1212) {
				document.getElementById("dVal2").value = null;
				document.getElementById("dVal2").disabled = true;
			}
		}   */

		$scope.characterLength = function (value, max) {
			if(value && (value.toString().length >= max)) {
				toaster.pop('warning', "No more characters allowed");
			}
		};

		$scope.data1check = function () {
			if(document.getElementById("dVal1").disabled == true) {
				document.getElementById("dVal1").disabled = false;
			}
			else {
				document.getElementById("dVal1").value = -1212;
				document.getElementById("dVal1").disabled = true;
			}
		}

		$scope.data2check = function () {
			if(document.getElementById("dVal2").disabled == true) {
				document.getElementById("dVal2").disabled = false;
			}
			else {
				document.getElementById("dVal2").value = -1212;
				document.getElementById("dVal2").disabled = true;
			}
		}

		$scope.submit = function () {
			var lowerYellowBound = $scope.lower;
			var upperYellowBound = $scope.upper;
			var inputDataValue = $scope.dataValue;
			var inputDataValue2 = $scope.dataValue2;

			lowBound = headlineFactory.checkLowBound($scope.color);

			enabled = headlineFactory.checkEnabled($scope.disabled);
			
			inputDataValue = headlineFactory.checkDataValue(inputDataValue);
			
			$scope.headline = headlineFactory.checkHeadline($scope.headline);

			inputDataValue2 = headlineFactory.checkDataValue(inputDataValue2);
			
			$scope.headline2 = headlineFactory.checkHeadline($scope.headline2);
			
			lowerYellowBound = headlineFactory.checkLowYellowBound(lowerYellowBound);

			upperYellowBound = headlineFactory.checkUpperYellowBound(upperYellowBound);

			$scope.ownerEmail = headlineFactory.checkEmail($scope.ownerEmail);	

			$scope.lastUpdated = moment().format("YYYYMMDDTHHmmss");

			var tileControls = {
				Tile: $scope.title,
				Automatic: enabled,
				DataValue: inputDataValue,
				Headline: $scope.headline,
				DataValue2: inputDataValue2,
				Headline2: $scope.headline2,
				LowDataBound: lowerYellowBound,
				HighDataBound: upperYellowBound,
				LowerBound: lowBound,
				Owner: $scope.ownerEmail,
				LastUpdated: $scope.lastUpdated
			}

			sharedProperties.adminInputs = tileControls;

			if (! $scope.owner.input.$error.email){
				var overwrite = confirm('Are you sure you want to overwrite the current headline?');

				// var overwrite = confirm.render('Confirm Headine', 'Are you sure you want to overwrite the current headline?')

				// var popupWidth = window.innerWidth;
				// var popupHeight = 

				if(overwrite) {

					//if(tileControls.Headine.indexOf)

					headlineFactory.updateTileData();					
					$modalInstance.close('tileControls');	
				}
			}		    
		};

		$scope.cancel = function () {
		    $modalInstance.dismiss('cancel');
		};
	};

	angular.module('app.main').service('sharedProperties', sharedProperties);

	function sharedProperties(){
		var _id = {};
		var _lowerBound = {};
		var _upperBound = {};
		var _lowColor = {};
		var _owner = {};
		var _headline = {};
		var _dataValue = {};
		var _headline2 = {};
		var _dataValue2 = {};
		var _tileTitle = {};
		var _tile = {};
		var _adminInputs = {};
		var _lastUpdated = {};

		this.id = _id;
		this.lowerBound = _lowerBound;
		this.upperBound = _upperBound;
		this.lowColor = _lowColor;
		this.owner = _owner;
		this.headline = _headline;
		this.dataValue = _dataValue; 
		this.headline2 = _headline2;
		this.dataValue2 = _dataValue2; 

		this.tileTitle = _tileTitle;

		this.tile = _tile;

		this.adminInputs = _adminInputs;

		this.lastUpdated = _lastUpdated;
	}
})();