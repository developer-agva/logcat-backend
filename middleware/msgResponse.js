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
         "Header Color":"#808080",
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
]

module.exports = {
    deviceIdArr,
    trendsDataKey
}