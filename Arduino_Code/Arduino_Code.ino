#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h> 
#define ARDUINOJSON_USE_LONG_LONG == 1
#include <Servo.h>


/*****************************
******Global Vars**************
*******************************/
const int threshold = 700;
const int sensorPin = A0;    // sensor input
const int LEDpin= D1;      // LED pin

const int IRSensor1 = D2; // the number of the infrared sensor pin
const int IRSensor2 = D3; 



const String ssid = "0_._0"; //Wifi Nertwork name
const String password = "g00gle000"; // Wifi Password
const String host = "https://ecen203smartcity-hossamhamzahm-gmailcom.vercel.app";
const String url = "/esp/";
String json;
DynamicJsonDocument doc(100);



// Use WiFiClient class to create TCP connections 
// WiFiClientSecure client; 
WiFiClientSecure client; 
HTTPClient http; 


/*************
******Functions*****
**************/

// returning the local IP as a string
String IpAddress2String(const IPAddress& ipAddress)
{
    return String(ipAddress[0]) + String(".") +
           String(ipAddress[1]) + String(".") +
           String(ipAddress[2]) + String(".") +
           String(ipAddress[3]);
}

// Inatialize Wifi connection
void connect_wifi(){
  WiFi.mode(WIFI_STA); 
  WiFi.begin(ssid, password);

  Serial.println();
  Serial.println("Connecting to " + ssid + "...");
  while(WiFi.status() != WL_CONNECTED){
    delay(100);
    Serial.print(".");
  }

  Serial.println("IP address: " + IpAddress2String(WiFi.localIP()));
  Serial.println();
}

int SendData(){
  // Send request
  json = "";
  serializeJson(doc, json);


  client.setInsecure(); // this is the magical line that makes everything work
  if (!client.connect(host, 443)) 
  { 
    Serial.println("connection failed"); 
    return -1; 
  }
    
  http.begin(client, host + url); //HTTP
  http.addHeader("Content-Type", "application/json");
  http.POST(json);

  
  // Read response
  // Serial.println(http.getString());
  deserializeJson(doc, http.getString());

  
  // Disconnect
  http.end();
  return 1;
}










void setup() {
  Serial.begin(115200);
  delay(10);
  connect_wifi();

  pinMode(LEDpin, OUTPUT);
  pinMode(sensorPin, INPUT);

  pinMode (IRSensor1, INPUT); //initialize the infrared sensor sensor pin as an input:
  pinMode (IRSensor2, INPUT);
}



void loop() {
  // Photo resistor and light pole control
  int photoResistor = analogRead(sensorPin);
  doc["photoResistor"] = photoResistor;
  
  if((String)doc["mode"] == "manual"){
      digitalWrite(LEDpin, (int)doc["status"]);
  }
  else{
      if (photoResistor > threshold) {
        digitalWrite (LEDpin, LOW);
      }
      else {
        // turn the LED off
        digitalWrite(LEDpin, HIGH);
      }
  }


  // parking slots code and the time passed
  doc["time"] = millis();
  doc["slot1"] = 0;
  doc["slot2"] = 0;
  if (!digitalRead (IRSensor1)){
        doc["slot1"] = 1;
    }
    
  if (!digitalRead (IRSensor2)){
        doc["slot2"] = 1;
  }

  // sending the data to the server
  if(SendData() == -1) return;
  delay(100);
}
