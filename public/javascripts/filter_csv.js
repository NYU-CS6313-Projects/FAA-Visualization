var fs = require('fs');
var async = require('async');

var process_data = function(accidents_csv_path, remarks_csv_path, file_path, callback){
  var accidents_categories = {};  //  Example - Key : 8, Value : date
  var pilots_categories = {};
  var aircrafts_categories = {};
  var clean_data = [];  //  Data structure to hold all the filtered information.  

  async.parallel([
    function(callback){
      fs.readFile(remarks_csv_path, 'utf-8', function(err, remarks){
        if(err) throw err;
        remarks = CSVToArray(remarks);
        var remarks_dict = {};
        remarks.forEach(function(d){
          remarks_dict[d[0]] = d[1];
        });
        callback(null, remarks_dict);
      });
    },
    function(callback){
      // console.log(remarks.length);
      fs.readFile(accidents_csv_path, 'utf-8', function(err, accidents){
        if(err) throw err;
        accidents = CSVToArray(accidents);
        accidents[0].filter(function(d, i){
          i = i.toString();
          //  Accident Categories
          switch(d)
          {
            case 'c9': 
              accidents_categories[i] = 'date';
              break;
            case 'c78': 
              accidents_categories[i] = 'primary_cause';
              break;
            case 'c76': 
              accidents_categories[i] = 'fatalities';
              break;
            case 'c14':
              accidents_categories[i] = 'city';
              break;
            case 'c13':
              accidents_categories[i] = 'state';
              break;
            case 'c104':
              accidents_categories[i] = 'weather';
              break;
            case 'c114': 
              accidents_categories[i] = 'visibility';
              break;
            case 'c110': 
              accidents_categories[i] = 'light';
              break;
            case 'c94': 
              accidents_categories[i] = 'type';
              break;  
            default:
              break;
          }
          //  Pilot Categories
          switch(d)
          {
            case 'c50': 
              pilots_categories[i] = 'pilot_age';
              break;
            case 'c40': 
              pilots_categories[i] = 'pilot_certification';
              break;
            case 'c53': 
              pilots_categories[i] = 'total_hours_model_flown';
              break;
            case 'c54': 
              pilots_categories[i] = 'hours_model_flown_90_days';
              break;
            case 'c56': 
              pilots_categories[i] = 'total_hours_flown';
              break;
            case 'c55': 
              pilots_categories[i] = 'hours_flown_90_days';
              break;
            default:
              break;
          }
          //  Aircraft Categories
          switch(d)
          {
            case 'c23': 
              aircrafts_categories[i] = 'aircraft_make';
              break;
            case 'c24': 
              aircrafts_categories[i] = 'aircraft_model';
              break;
            case 'c151': 
              aircrafts_categories[i] = 'engines';
              break;
            case 'c31': 
              aircrafts_categories[i] = 'hours_airframe';
              break;
            default:
              break;
          }
      });
      callback(null, accidents);
    });
  }], function(err, results){
      //  Result[0] contains remarks_dict
      //  Result[1] contains accidents
      remarks_dict = results[0];
      accidents = results[1];

      console.log(accidents.length);

      accidents.map(function(row, i){
        //  Take any row but the headers, and all Part 91s
        if(i >= 0 && row[2] == 91){

          var data_object = {};
          
          for(var key in accidents_categories){
            row[key] = row[key].replace(/[ \t]+$/, '');
            switch(accidents_categories[key]){
              case 'type':
                row[key] = accident_codes.type[row[key]];
                break;
              case 'primary_cause':
                row[key] = accident_codes.primary_cause[row[key]];
                break;
              case 'light':
                row[key] = accident_codes.light[row[key]];
                break;
              case 'visibility':
                row[key] = accident_codes.visibility[row[key]];
                break;
              case 'damage':
                row[key] = accident_codes.damage[row[key]];
                break;
              case 'weather':
                row[key] = accident_codes.weather[row[key]];
                break;
              default:
                break;
            }
            if(accidents_categories[key] == 'date'){row[key] = formatDate(row[key]);}
            else{if(!isNaN(parseInt(row[key]))){row[key] = parseInt(row[key])};}
            if(typeof(row[key]) == 'undefined' || row[key] == ''){row[key] = null;}
            data_object[accidents_categories[key]] = row[key];
          }
          for(var key in pilots_categories){
            row[key] = row[key].replace(/[ \t]+$/, '');
            switch(pilots_categories[key]){
              case 'pilot_certification':
                row[key] = pilot_codes.pilot_certification[row[key]];
                break;
              case 'pilot_rating':
                row[key] = pilot_codes.pilot_rating[row[key]]; 
                break;
              case 'pilot_qualification': 
                row[key] = pilot_codes.pilot_qualification[row[key]];
                break;
              default: 
                break;
            }
            if(!isNaN(parseInt(row[key]))){row[key] = parseInt(row[key])};
            if(typeof(row[key]) == 'undefined' || row[key] == ''){row[key] = null;}
            data_object[pilots_categories[key]] = row[key];
          }
          for(var key in aircrafts_categories){
            switch(aircrafts_categories[key]){
              case 'aircraft_make':
              case 'aircraft_model':
                row[key] = row[key].replace(/[ \t]+$/, '');
                break;
              default:
                break;
            }
            if(!isNaN(parseInt(row[key]))){row[key] = parseInt(row[key])};
            if(typeof(row[key]) == 'undefined' || row[key] == ''){row[key] = null;}
            data_object[aircrafts_categories[key]] = row[key];
          }
          data_object.remarks = remarks_dict[row[0]];
          // console.log(data_object);
          clean_data.push(data_object);
        }
        if(i === accidents.length - 1){
            if (callback && typeof(callback) === "function") {
              fs.writeFile(file_path, ConvertToCSV(clean_data), function (err) {
                if (err) throw err;
                console.log(file_path + " " + "was written!");
                callback(clean_data.length);
              });
            }
          }
      });
    });
};

function CSVToArray( strData, strDelimiter ){
  strDelimiter = (strDelimiter || ",");

  var objPattern = new RegExp(
      (
          // Delimiters.
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
          // Quoted fields.
          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
          // Standard fields.
          "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ), "gi");

  var arrData = [[]];
  var arrMatches = null;

  while(arrMatches = objPattern.exec(strData)){

      // Get the delimiter that was found.
      var strMatchedDelimiter = arrMatches[1];

      if(strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter){
          arrData.push([]);
      }

      var strMatchedValue;

      if(arrMatches[2]){
        strMatchedValue = arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"");
      } 
      else{
          strMatchedValue = arrMatches[3];
      }

      arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return(arrData);
}

function ConvertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = 'date,state,city,weather,light,visibility,fatalities,primary_cause,type,pilot_age,total_hours_model_flown,hours_model_flown_90_days,hours_flown_90_days,total_hours_flown,pilot_certification,engines,aircraft_make,aircraft_model,hours_airframe,remarks' + '\r\n';

  //  For each object.
  for (var i = 0; i < array.length; i++) {
    var line = '';
    //  For each key in the object.
    for (var index in array[i]) {
        if (line != '') line += ','

        line += array[i][index];
    }

    str += line + '\r\n';
  }

  return str;
}

function formatDate(date){
  return date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8);
}

var accident_remarks_dict = {
  1975 : { accidents_csv_path : '../data/accidents/a1975_79.csv', remarks_csv_path : '../data/remarks/e1975_79.csv', file_path : '../data/part_91_csv/data_1975_79.csv'},
  1980 : { accidents_csv_path : '../data/accidents/a1980_84.csv', remarks_csv_path : '../data/remarks/e1980_84.csv', file_path : '../data/part_91_csv/data_1980_84.csv'},
  1985 : { accidents_csv_path : '../data/accidents/a1985_89.csv', remarks_csv_path : '../data/remarks/e1985_89.csv', file_path : '../data/part_91_csv/data_1985_89.csv'},
  1990 : { accidents_csv_path : '../data/accidents/a1990_94.csv', remarks_csv_path : '../data/remarks/e1990_94.csv', file_path : '../data/part_91_csv/data_1990_94.csv'},
  1995 : { accidents_csv_path : '../data/accidents/a1995_99.csv', remarks_csv_path : '../data/remarks/e1995_99.csv', file_path : '../data/part_91_csv/data_1995_99.csv'},
  2000 : { accidents_csv_path : '../data/accidents/a2000_04.csv', remarks_csv_path : '../data/remarks/e2000_04.csv', file_path : '../data/part_91_csv/data_2000_04.csv'},
  2005 : { accidents_csv_path : '../data/accidents/a2005_09.csv', remarks_csv_path : '../data/remarks/e2005_09.csv', file_path : '../data/part_91_csv/data_2005_09.csv'},
  2010 : { accidents_csv_path : '../data/accidents/a2010_14.csv', remarks_csv_path : '../data/remarks/e2010_14.csv', file_path : '../data/part_91_csv/data_2010_14.csv'}
};

//  Accident Codes
var accident_codes = {
  //  According to AIDCODES.doc file from the FAA website. Under 'Type of Accident/Incident'
  type : {
    AA : 'Loss of Directional Control - Ground Loop',         
    AB : 'Loss of Directional Control - Drag Wingtip',         
    AC : 'Loss of Directional Control',          
    BX : 'Hard Landing',          
    CA : 'Wheels - Up Landing', 
    CB : 'Wheels - Down Landing in Water',
    CC : 'Gear Collapse',  
    CD : 'Gear Retrieval',
    DC : 'Decompression',                
    DR : 'Dynamic Rollover',             
    DX : 'Undershoot Landing',               
    EX : 'Overshoot Landing',               
    FX : 'Nose Up or Over',   
    GR : 'Helicopter - Ground Resonance', 
    GX : 'Midair Collisions (Both in Flight)', 
    HA : 'Aircraft Collisions - One Airborne', 
    HB : 'Aircraft Collisions - On Ground', 
    IA : 'Controllable Collision With Ground',    
    IB : 'Uncontrollable Collision With Ground',   
    IC : 'Controllable Collision With Water',    
    ID : 'Uncontrollable Collision With Water',    
    JA : 'Collision With Wires-Poles',         
    JB : 'Collision With Trees',
    JC : 'Collision With Residences',    
    JD : 'Collision With Other Buildings',          
    JE : 'Collision With Fences and Posts',   
    JF : 'Collision With Electronic Towers',    
    JG : 'Collision With Runway/Approach Lights',          
    JH : 'Collision With Airport Hazard',
    JI : 'Collision With Birds',   
    JJ : 'Collision With Other',          
    JK : 'Collision With Animal',        
    KX : 'Stall',                        
    LX : 'Spin',                        
    MA : 'Fire or Explosion - In Flight', 
    MB : 'Fire or Explosion - On Ground',
    NA : 'Airframe Failure - In Flight', 
    NB : 'Airframe Failure - On Ground',    
    OA : 'Engine Tear Away',      
    OB : 'Engine Malfunction',    
    OC : 'Forced Landing',     
    PA : 'Propeller Blade',      
    PB : 'Helicopter Blade',      
    PC : 'Jet Blade',      
    PD : 'Jet Rotor',        
    PE : 'Propeller Blast',        
    PF : 'Jet Blast',        
    PG : 'Rotor Blast',                        
    PH : 'Wake Turbulence - Vortex',     
    PM : 'Propeller Malfunction or Failure',     
    QA : 'Propeller/Rotor Accident to Person',    
    QB : 'Jet Intake/Exhaust Accident',      
    RA : 'Turbulence in Flight (Person Injury)',      
    RB : 'Turbulence in Flight (Aircraft Damage)',      
    RC : 'Turbulence in Flight (Aircraft and Person)',      
    RD : 'Hail Damage to Aircraft',     
    RE : 'Lightning Strike',       
    RF : 'Blown Over (Wind Only)',     
    SA : 'Evasive Maneuver (Person Injury)',     
    SB : 'Evasive Manuever (Structure Damage)',   
    SC : 'Evasive Maneuver (Structure and Person)',   
    SD : 'Missing Aircraft', 
    SE : 'Other/Miscellaneous',  
    SF : 'Undetermined',
    SY : 'System Malfunction or Failure',
    TS : 'Tail Strike',
    YY : 'Emergency Parachute', 
    99999 : 'Invalid'    
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Cause Factors'
  primary_cause : {
    AA : 'Failed to Advise Unsafe Airport Conditions',      
    AF : 'Improper Maintenance of Flying Aircraft at Airport',    
    AI : 'Inadequately Maintained Airway for Flying Aircraft',   
    AL : 'Didn\t Fly at Assigned Altitude - IFR Clearance',     
    AP : 'Inadequately Maintained Approach - Flying Aircraft',   
    AS : 'Failed to Maintain Adequate Flying Speed',     
    AT : 'Failed to Advise of Other Traffic',      
    AU : 'Attempt Operation With Different Equipment',    
    AW : 'Failed to Advise of Unsafe Weather Conditions',      
    BS : 'Struck Birds in Flight Path',      
    BW : 'Blown Over By Strong Wind',     
    CE : 'Didn\'t Clear Engine in Glide',    
    CH : 'Miused Carburetor Heat / Deicing Procedure',      
    CI : 'Issued Improper Conflicting Instructions',      
    CP : 'Student Pilot Carried Passengers',        
    CS : 'Improper Operationl Cooling System - Oil Engine',        
    DC : 'Failed to Correct for Drift',       
    DE : 'Deficiency Company Maintainance of Equipment and Services',       
    DP : 'Failed to Comply/Dispatch Procedures/Regulations',     
    DR : 'Drank Alcoholic Beverage',       
    DW : 'Downwind Takeoff or Landing',     
    EL : 'Attempted Operations Beyond Experience Level',     
    EQ : 'Improper Emergency/Equipment Operation',    
    ES : 'Started Engine Without Assistance/Equipment',      
    FA : 'Collided With Object on Final Approach',      
    FC : 'Cleared Flight Inadequate - Flying Aircraft to Destination',     
    FE : 'Failed to Use Engine Fire Extinguisher',      
    FN : 'Unsafe Conditions and Failed to Mark Obstruction',    
    FO : 'Miscellaneous Misuse - Fuel System',    
    FP : 'Failed to Follow Approved Procedure/Instruction',     
    FR : 'Failed to Relinquish Control',       
    FT : 'Improper Management - Fuel Tank Selector',     
    FW : 'Unported Fuel',     
    FX : 'Full to Low Fuel',     
    GA : 'Delayed in Initiating Go-around',    
    GC : 'Improper Operational Brake - Flight Control-Ground',        
    GE : 'Misused or Failed to Use Emergency Gear',          
    GF : 'Operational Gear Control Failed',          
    GI : 'Inadvertant Retrieval of Landing Gear',        
    GL : 'Extended Gear Too Late',          
    GN : 'Forgot to Extend Landing Gear',        
    GP : 'Retracted Gear Early on Takeoff',        
    HA : 'Failed to Avoid Aircraft - None or One Airborne',          
    HG : 'Failed to Avoid Ground or Water Collision',        
    HO : 'Failed to Avoid Objects or Obstructions',          
    HT : 'Failed to Avoid TV or Radio Tower',          
    IA : 'Aircraft Improperly Aligned With Runway',       
    IC : 'Hazardous Material Onboard Aircraft',       
    IE : 'Aircraft Improperly Equipped for Flight',      
    IF : 'Improper Inspection of Flying Aircraft',        
    IG : 'Improper Use of Ignition System',     
    II : 'Inadequate Inspection of Aircraft - Preflight',       
    IO : 'Improper Operation of Flight Controls in Air',        
    IP : 'Improper Instruction and Procedure - Takeoff and Landing',        
    IS : 'Inadequate Space - Aircraft Wake Turbulence',      
    IT : 'Inadequate Flight/Ground Training - Procedures',     
    LA : 'Aerobatics Below Safe Altitude',    
    LC : 'Lost Control in Adverse Weather Conditions',      
    LO : 'Improper Level Off',        
    LR : 'Lost Ground Reference at Night - VFR',     
    MA : 'Failed to Avoid Aircraft - Both Airborne',    
    MC : 'Operator Gave Incorrect Information to Crew',   
    ME : 'Failed/Incorrect Usage of Miscellaneous Equipment',     
    MI : 'Misunderstood Orders, Instruction, etc.',   
    MM : 'Misused Mixture Control', 
    MO : 'Pilot/Crew Mismanaged Aircraft System',   
    MT : 'Misuse of Trim',     
    NO : 'Failed to Issue Notice to Airman',
    OB : 'Advanced Throttle Rapidly',   
    OC : 'Lost On/Off Course - VFR ', 
    OF : 'Improper Operation of Flying Aircraft',     
    OM : 'Other/Miscellaneous',     
    OP : 'Improper Operation of Propeller',  
    OS : 'Landing Far Down / Land Area Overshot',   
    OT : 'Failed to Attain Proper Operational Temperature',     
    PA : 'Taxied/Parked Without Proper Assistance',      
    PB : 'Poor Preflight Plan - Weight and Balance',    
    PC : 'Pilot Incapacitated (Excludes Alcohol)',    
    PD : 'Failed to Provide Adequate Directions, Manuals, etc.',    
    PF : 'Poor Preflight Plan - Fuel Quantity',      
    PI : 'Control Interference By Passenger/Crew',    
    PL : 'Early Liftoff - Intercepted By Terrain',      
    PO : 'Inadequate/Improper Preflight Planning/Preparation',      
    PP : 'Poor Preflight Planning - Aircraft Performance',        
    PS : 'Inadequate Flight/Supervising Pilot',    
    PW : 'Poor Preflight Planning - Weather Conditions',      
    RC : 'Cleared Aircraft Waterway for Condition',      
    RI : 'Unable to Utilize Navigation on Flying Aircraft Properly - IFR',       
    RS : 'Failed to Maintain Adequate Rotor RPM',         
    RV : 'Unable to Utilize Navigation on Flying Aircraft Properly - VFR',        
    SA : 'Improperly Serviced Aircraft',         
    SC : 'Inadequate Supervision/Training for Ramp Coverage',       
    SD : 'Struck Animal',          
    SN : 'Unsuitable Terrain Snow/Ice Area',         
    SO : 'Miscellaneous Unsafe Actions - Starting Engine',         
    SP : 'Walked into Propeller or Rotor',       
    SR : 'Improper/Inadequate Snow/Ice Removal From Aircraft',       
    ST : 'Continued Flight Area - Severe Turbulence',  
    TC : 'Insufficient Terrain Clearance in Route',
    TO : 'Delayed Action in Aborted Takeoff',    
    TP : 'Improper Procedure in Torque Flight Compensator',    
    TX : 'Takeoff - Adverse Weather Condition - Immediate Vicinity',  
    UA : 'Unauthorized Action',    
    UD : 'Undetermined',      
    UN : 'Pilot/Miscellaneous Unsafe Actions',    
    UO : 'Unsafe Acts By Third Party',    
    US : 'Landed Short',      
    UT : 'Selected Unsuitable Terrain',    
    VM : 'Operation Below Visual Meteorological Conditions',     
    WF : 'Incorrect Weather Forecast',    
    WO : 'Whiteout Conditions',    
    WR : 'Incomplete Weather Report',    
    WS : 'Windshear',      
    WX : 'Continued VFR Flight Into Adverse Weather Conditions',    
    XL : 'Continued Aircraft Speed - Exceeded Load Design',  
    99999 : 'Invalid' 
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Phase of Flight'
  //  IFR - Instrument Flight Rules
  //  VFR - Visual Flight Rules
  flight_phase : {
    AA : 'Starting Engines',            
    AB : 'Idling Engines',           
    AC : 'Engine Run-Up',           
    AD : 'Idling Rotors',           
    BA : 'Power on Descent (Rotorcraft)',      
    BB : 'Autorotation Descent (Rotorcraft)',       
    BC : 'In Traffic Pattern - Circling', 
    BD : 'Final Approach',
    BE : 'Initial Approach - IFR',  
    BF : 'Final Approach - IFR',   
    BG : 'Go Round (Aborted VFR)', 
    BH : 'Missed Approach - IFR',
    BI : 'Forced Landing',   
    CX : 'Climb to Cruise',   
    DA : 'Normal Cruise',   
    DB : 'Holding IFR',   
    DC : 'Acrobatics - Buzzing', 
    DD : 'Forced/Precautionary Landing From Cruise', 
    DE : 'Low Level Operations',     
    DF : 'Unauthorized Low Level Operations',    
    DG : 'Practice Training Manuevers',    
    DH : 'Formation Flying',       
    EX : 'Descent',       
    FA : 'Operations on Ground To Takeoff/Rotorcraft',     
    FB : 'Operations on Ground From Landing/Rotorcraft',     
    FC : 'Aerial Taxi to Takeoff/Rotorcraft',     
    FD : 'Aerial Taxi From Landing/Rotorcraft',    
    FE : 'Ground Taxi, Other Airplane',     
    FF : 'Aerial Taxi, Other Helicopter',     
    FG : 'Other Ground Operations',       
    GX : 'Hovering',       
    HA : 'Level Off Touchdown',   
    HB : 'Roll-Out (Fixed Wing)',   
    HC : 'Roll-Out (Rotorcraft)',   
    HD : 'Power On Vertical Landing/Rotorcraft', 
    HE : 'Power Off Vertical Land/Autorotate', 
    HF : 'Power On Run Landing (Rotorcraft)', 
    HG : 'Power Off Run Landing (Autorotation)', 
    HH : 'Touch and Go Landing',   
    HK : 'Slope Landing',    
    HM : 'Settle With Power (Rotorcraft)',
    IA : 'Takeoff Ground Roll',  
    IB : 'Takeoff Initial Climb (First Power Reduction)',  
    IC : 'Takeoff Vertical',  
    ID : 'Takeoff Running (Vertical Takeoff and Landing)',
    IE : 'Takeoff Aborted (Fixed Wing)',  
    IF : 'Takeoff Aborted (Vertical)',  
    IG : 'Takeoff Aborted (Running Takeoff)',      
    IH : 'Forced/Precautionary Landing',       
    JX : 'Unknown',           
    KA : 'Simulated Forced Landing/Takeoff',       
    KB : 'Safely Takeoff Climb',           
    KC : 'Safely Cruise',          
    KD : 'Safely Final Approach',           
    KE : 'Dafely Traffic Pattern',           
    KF : 'Safely Go Around',            
    KG : 'Safely Autorotation',          
    PJ : 'Parachute Jumping',         
    PL : 'Pinnacle Landing',           
    SR : 'Scud Running',           
    99999 : 'Invalid'     
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Light Conditions'
  light : {
    1 : 'Day',        
    2 : 'Night',       
    3 : 'Dawn',       
    4 : 'Dusk',       
    5 : 'Unknown',     
    99999 : 'Invalid'
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Visibility'
  visibility : { 
    G10 : 'Greater than 10 miles',
    LS1 : 'Less than 1 mile',
    1 : '1 mile',
    10 : '10 miles',
    2 : '2 miles',
    3 : '3 miles',
    4 : '4 miles',
    5 : '5 miles',
    6 : '6 miles',
    7 : '7 miles',
    8 : '8 miles', 
    9 : '9 miles',
    99999 : 'Invalid'
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Damage'
  damage : {
    D : 'Demolished',       
    M : 'Minor',        
    N : 'None',       
    S : 'Substantial',        
    U : 'Unknown',      
    99999 : 'Invalid'
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Flying Conditions - Secondary'
  weather : {
    A : 'Tornado',      
    B : 'Hurricane',     
    C : 'Mountain Wave',    
    D : 'Frontal Activity',    
    E : 'Line Squall',    
    F : 'Fog',          
    G : 'Wind',      
    H : 'Light Rain',        
    I : 'Light Freezing Rain',        
    J : 'Heavy Rain',        
    K : 'Heavy Freezing Rain',    
    L : 'Low Ceiling',              
    M : 'Heavy Snow',      
    N : 'Light Snow',      
    O : 'Freezing Temperature',    
    P : 'Frontal Passage',      
    Q : 'Whirlwind',   
    R : 'Frost',       
    S : 'Weather Non-Factor',   
    T : 'Thunderstorm',     
    U : 'Turbulence',   
    V : 'Other',               
    W : 'Unknown',
    99999 : 'Invalid'
  }
};

//  Pilot Codes
var pilot_codes = {
  //  According to AIDCODES.doc file from the FAA website. Under 'Pilot Certification'
  pilot_certification : {
    F1 : 'Private Pilot Flight Instructor',                
    F3 : 'Commerical Pilot Flight Instructor',                
    F9 : 'Airline Transport Pilot Flight Instructor',                
    TT : 'Pilot Not Certified',
    XX : 'Student',  
    00 : 'Special Purpose',  
    01 : 'Private Pilot',  
    02 : 'Recreational Pilot',
    03 : 'Commercial Pilot', 
    09 : 'Airline Transport Pilot',                   
    99 : 'Unknown'            
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Pilot Ratings Airplane'
  pilot_rating : {
    00 : 'No Rating',
    01 : 'ASEL',          
    02 : 'AMEL',          
    03 : 'ASES',       
    04 : 'AMES',          
    05 : 'ASMEL',         
    06 : 'ASEL ASES',   
    07 : 'ASEL AMES',   
    08 : 'ASEL ASMES', 
    09 : 'ASMEL ASMES', 
    10 : 'ASMEL ASES',    
    11 : 'ASMEL AMES',     
    12 : 'AMEL ASES',   
    13 : 'AMEL AMES',     
    14 : 'AMEL ASMES',       
    20 : 'RH',                 
    21 : 'RH ASEL',       
    22 : 'RH AMEL',              
    23 : 'RH ASES',          
    24 : 'RH AMES',         
    25 : 'RH ASMEL',                 
    26 : 'RH ASEL ASES',    
    27 : 'RH ASEL AMES',    
    28 : 'RH ASEL ASMES',   
    29 : 'RH ASMEL ASMES', 
    30 : 'RH ASMEL ASES',   
    31 : 'RH ASMEL AMES', 
    32 : 'RH AMEL ASES',    
    33 : 'RH AMEL AMES',  
    34 : 'RH AMEL ASMES',           
    40 : 'GLIDER',                    
    41 : 'G ASEL',         
    42 : 'G AMEL',         
    43 : 'G ASES',        
    44 : 'G AMES',         
    45 : 'G ASMEL',       
    46 : 'G ASEL ASES',   
    47 : 'G ASEL AMES',   
    48 : 'G ASEL ASMES',  
    49 : 'G ASMEL ASMES', 
    50 : 'G ASMEL ASES',  
    51 : 'G ASMEL AMES',  
    52 : 'G AMEL ASES',  
    53 : 'G AMEL AMES', 
    54 : 'G AMEL ASMES',
    60 : 'GLIDER RH',   
    61 : 'G RH ASEL',       
    62 : 'G RH AMEL',        
    63 : 'G RH ASES',       
    64 : 'G RH AMES',       
    65 : 'G RH ASMEL',       
    66 : 'G RH ASEL ASES',   
    67 : 'G RH ASEL AMES',   
    68 : 'G RH ASEL ASMES',  
    69 : 'G RH ASMEL ASMES', 
    70 : 'G RH ASMEL ASES',  
    71 : 'G RH ASMEL AMES', 
    72 : 'G RH AMEL ASES',   
    73 : 'G RH AMEL AMES',   
    74 : 'G RH AMEL ASMES',  
    99999 : 'Invalid'
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Pilot Qualifications'
  pilot_qualification : {
    E : 'Flight Instructor Qualified in Operations',         
    F : 'Flight Instructor Not Qualified In Operations',           
    G : 'Qualified in Operations - Not Flight Instructor',         
    H : 'Non-Qualified in Operations - Not Flight Instructor',         
    M : 'Unknown - Foreign Pilot',        
    N : 'No Medical Certificate or Expired',       
    P : 'No Biennial Flight Review',           
    R : 'Not Properly Rated',         
    S : 'Qualified',             
    T : 'Not Qualified',           
    U : 'No Medical or Biennial',         
    V : 'No Medical - Not Rated',         
    W : 'No Biennial - Not Rated',         
    X : 'Certificate Suspended/Revoked',         
    99999 : 'Pilot Qualified Invalid'        
  }
};

//  Aircraft Codes
var aircraft_codes = {
  //  According to AIDCODES.doc file from the FAA website. Under 'Aircraft Weight Class'
  weight_class : {
    1 : 'Under 12501 lbs.',
    2 : 'Over 12500 lbs.',
    99999 : 'Invalid'
  },
  //  According to AIDCODES.doc file from the FAA website. Under 'Aircraft Wing Code'
  wing_information : {
    B : 'Lighter Than Air',
    D : 'Delta/Swing Wing',
    G : 'Rotary Wing',
    H : 'Monoplane - High/Parasol Wing',
    K : 'Kite/Sail Wing',
    L : 'Monoplane - Low Wing',
    M : 'Monoplane - Middle Wing',
    Q : 'Multi Wing',
    S : 'STOL/VTOL/Tilt Wing', 
    99999 : 'Invalid'
  }
};

//  Asynchronous Data Processing
async.parallel([function(callback){
  process_data(accident_remarks_dict['1975'].accidents_csv_path, accident_remarks_dict['1975'].remarks_csv_path, accident_remarks_dict['1975'].file_path, function(data_length){
    console.log("1975 processed.");
    callback(null, data_length);
  });
}, 
function(callback){
  process_data(accident_remarks_dict['1980'].accidents_csv_path, accident_remarks_dict['1980'].remarks_csv_path, accident_remarks_dict['1980'].file_path, function(data_length){
    console.log("1980 processed.");
    callback(null, data_length);
  });
},
function(callback){
  process_data(accident_remarks_dict['1985'].accidents_csv_path, accident_remarks_dict['1985'].remarks_csv_path, accident_remarks_dict['1985'].file_path, function(data_length){
    console.log("1985 processed.");
    callback(null, data_length);
  });
},
function(callback){
  process_data(accident_remarks_dict['1990'].accidents_csv_path, accident_remarks_dict['1990'].remarks_csv_path, accident_remarks_dict['1990'].file_path, function(data_length){
    console.log("1990 processed.");
    callback(null, data_length);
  });
},
function(callback){
  process_data(accident_remarks_dict['1995'].accidents_csv_path, accident_remarks_dict['1995'].remarks_csv_path, accident_remarks_dict['1995'].file_path, function(data_length){
    console.log("1995 processed.");
    callback(null, data_length);
  });
},
function(callback){
  process_data(accident_remarks_dict['2000'].accidents_csv_path, accident_remarks_dict['2000'].remarks_csv_path, accident_remarks_dict['2000'].file_path, function(data_length){
    console.log("2000 processed.");
    callback(null, data_length);
  });
},
function(callback){
  process_data(accident_remarks_dict['2005'].accidents_csv_path, accident_remarks_dict['2005'].remarks_csv_path, accident_remarks_dict['2005'].file_path, function(data_length){
    console.log("2005 processed.");
    callback(null, data_length);
  });
},
function(callback){
  process_data(accident_remarks_dict['2010'].accidents_csv_path, accident_remarks_dict['2010'].remarks_csv_path, accident_remarks_dict['2010'].file_path, function(data_length){
    console.log("2010 processed.");
    callback(null, data_length);
  });
}], function(err, results){
  console.log(results[0]);
  console.log(results[1]);
  console.log(results[2]);
  console.log(results[3]);
  console.log(results[4]);
  console.log(results[5]);
  console.log(results[6]);
  console.log(results[7]);
});

function writeData(file_path, clean_data){
  fs.writeFile(file_path, ConvertToCSV(clean_data), function (err) {
    if (err) throw err;
    console.log(file_path + " " + "was written!");
  });
} 

