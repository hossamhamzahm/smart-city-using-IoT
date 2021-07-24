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
const int LEDpin= D5;      // LED pin

const int IRSensor1 = D2; // the number of the infrared sensor pin
const int IRSensor2 = D3; 



String ssid = "0_._0"; //Wifi Nertwork name
String password = "g00gle000"; // Wifi Password
String host = "192.168.1.12";
String url = "/esp/";
String json;
DynamicJsonDocument doc(100);



// Use WiFiClient class to create TCP connections 
// WiFiClientSecure client; 
WiFiClient client; 
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


  // client.setInsecure(); // this is the magical line that makes everything work
  if (!client.connect(host, 3000)) 
  { 
    Serial.println("connection failed"); 
    return -1; 
  }
    
  http.begin(client, "http://" + host + ":3000" + url); //HTTP
  http.addHeader("Content-Type", "application/json");
  http.POST(json);


  Serial.print("Sent Json: ");
  Serial.println(json);
  
  // Read response
  Serial.println(http.getString());
  deserializeJson(doc, http.getString());

  
  // Disconnect
  http.end();
  return 1;
}










void setup() {
  Serial.begin(115200);
  delay(10);
  connect_wifi();

  // begining of hassnaa's code
  pinMode(LEDpin, OUTPUT);
  pinMode(sensorPin, INPUT);
  // end of hassnaa's code


  // begining of esraa's code
  pinMode (IRSensor1, INPUT); //initialize the infrared sensor sensor pin as an input:
  pinMode (IRSensor2, INPUT);
  // end of Esraa's code
}



void loop() {
  int photoResistor = analogRead(sensorPin);
  doc["photoResistor"] = photoResistor;
  doc["time"] = millis();
  

/*Hassnaa's code ****/
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
/****Hassnaa's code */


/***Esraa's code ******/
  doc["slot2"] = 0;
  doc["slot1"] = 0;
  if (!digitalRead (IRSensor1)){
        doc["slot1"] = 1;
    }
    
  if (!digitalRead (IRSensor2)){
        doc["slot2"] = 1;
  }
/***Esraa's code ******/

  
  if(SendData() == -1) return;
  delay(100);
}
