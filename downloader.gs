function getFirstEmptyRowByColumnArray() {
  var spr = SpreadsheetApp.getActiveSpreadsheet();
  var column = spr.getRange('A:A');
  var values = column.getValues(); // get all data in one call
  var ct = 0;
  while ( values[ct] && values[ct][0] != "" ) {
    ct++;
  }
  //Logger.log(ct+1);
  return ct+1;
}

function get_aisa_data(estacion) {
  result = UrlFetchApp.fetch('https://www.aysa.com.ar/api/estaciones/getVariablesEstacionesHistorico/' + estacion);
  var result = JSON.parse(result);
  return result;
}

var estaciones = ["82E52984-F07F-4F84-9E6B-17E7F85D7478", "B8046881-1BC3-43F8-9C9B-841AC482CF85", "5FFBD91B-1EBA-49CE-9AFA-2129F9397D22"]

var code2estacion = {"82E52984-F07F-4F84-9E6B-17E7F85D7478": "palermo", "B8046881-1BC3-43F8-9C9B-841AC482CF85": "berazategui", "5FFBD91B-1EBA-49CE-9AFA-2129F9397D22": "bernal"}

function get_data(data,parameter){
  try {
    var result = data[parameter];
    return result[result.length-1].replace(".",",");
  } catch (exp) {
    return ""
  }
}

function process_aisa_data(aysa_data) {

  var fecha = aysa_data["fechaMedicion"].substring(0,19).replace("T"," ");
  var estacion = code2estacion[aysa_data["estacion"]];

  var variables = aysa_data["variables"];

  var velocidadViento = get_data(variables,"VelocidadViento");
  var temperatura = get_data(variables,"Temperatura");
  var rafagaViento = get_data(variables,"RafagaViento");
  var presion = get_data(variables,"Presion");
  var lluviaAcumuladaDiaria = get_data(variables,"LluviaAcumuladaDiaria");
  var humedad = get_data(variables,"Humedad");
  var nivelRio = get_data(variables,"NivelRio");
  var direccionViento = get_data(variables,"DireccionViento");

  var data = [fecha, estacion, velocidadViento, temperatura, rafagaViento, presion, nivelRio, lluviaAcumuladaDiaria, humedad, direccionViento];
  return data;
}

function update_google_sheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("aysa-estaciones");

  for (var estacion_i = 0; estacion_i < estaciones.length; estacion_i++) {
    var next_row = getFirstEmptyRowByColumnArray();
    var aysa_data = get_aisa_data(estaciones[estacion_i]);
    var data = process_aisa_data(aysa_data);

    for (var i = 1; i <= data.length; i++) {
      sheet.getRange(next_row,i,1,1).setValue(data[i-1]);
    }

  }
}
