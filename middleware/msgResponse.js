var deviceIdArr = [];

const trendsDataKey = [
    // for AgVa-Pro 002 or blank
    {
        "Mode":{
         "0":"Parameter",
         "1":"Mode",   
         "2":"PIP",
         "3":"PEEP",
         "4":"Mean Airway",
         "5":"VTi",
         "6":"VTe",
         "7":"MVe",
         "8":"MVi",
         "9":"FiO2",
         "10":"RR",
         "11":"I:E",
         "12":"Tinsp"
        },
        "ModeType":{
         "0":"Unit",
         "1":"ModeType",
         "2":"cmH2O",
         "3":"cmH2O",
         "4":"cmH2O",
         "5":"ml",
         "6":"ml",
         "7":"Litre",
         "8":"Litre",
         "9":"%",
         "10":"BPM",
         "11":"Ratio",
         "12":"sec"
        },
        "colorCode":{
         "Header Color":"#545454",
         "BG ODD Color":"#A1A1A1",
         "BG EVEN Color":"#DAD8D9",
         "0":"#FFFFFF",
         "1":"#000000",
         "2":"#000000",
         "3":"#000000",
         "4":"#000000",
         "5":"#000000",
         "6":"#000000",
         "7":"#000000",
         "8":"#000000",
         "9":"#000000",
         "10":"#000000",
         "11":"#000000",
         "12":"#000000"
        }   
    },

    // for Patient-Monitor for 003
    {
        "Mode":{
         "0":"", 
         "1":"HR",
         "2":"SpO2",
         "3":"Pulse",
         "4":"Nibp Sys",
         "5":"Nibp Dia",
         "6":"CO2",
         "7":"IBP Sys",
         "8":"IBP Dia",
         "9":"T-1",
         "10":"T-2",
         "11":"RR",
         "12":"RR",
        },
        "ModeType":{
         "0":"",
         "1":"/min",
         "2":"%",
         "3":"%",
         "4":"mmHg",
         "5":"mmHg",
         "6":"mmHg",
         "7":"mmHg",
         "8":"mmHg",
         "9":"cc",
         "10":"cc",
         "11":"bpm",
         "12":"bpm"
        },
        "colorCode":{
         "Header Color":"#545454",
         "BG ODD Color":"#292929",
         "BG EVEN Color":"#000000",
         "0":"#FFFFFF",
         "1":"#83BA67",
         "2":"#92F3E2",
         "3":"#92F3E2",
         "4":"#FF497C",
         "5":"#FF497C",
         "6":"#FFFFFF",
         "7":"#FFF200",
         "8":"#FFF200",
         "9":"#FF0000",
         "10":"#FF0000",
         "11":"#FFFFFF",
         "12":"#000000",
        }   
    },
]

module.exports = {
    deviceIdArr,
    trendsDataKey
}